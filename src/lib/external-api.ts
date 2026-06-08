import { NextRequest, NextResponse } from "next/server";
import {
  authenticateExternalApiToken,
  type ApiTokenScope,
  type AuthenticatedApiToken,
} from "@/lib/external-api-token";
import {
  corsHeaders,
  corsPreflightResponse,
  resolveAllowedOrigin,
} from "@/lib/external-api-cors";
import { logExternalApiRequest } from "@/lib/external-api-audit";
import {
  checkDailyQuota,
  dailyQuotaHeaders,
} from "@/lib/external-api-quota";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { MAX_BODY_BYTES } from "@/lib/external-api-schemas";
import { labels } from "@/lib/labels";

const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export type ExternalApiContext = {
  token: AuthenticatedApiToken;
  clientIp: string | null;
  corsOrigin: string | null;
};

function getClientIp(request: NextRequest): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}

function jsonWithCors(
  body: unknown,
  status: number,
  corsOrigin: string | null,
  extraHeaders?: Record<string, string>
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { ...corsHeaders(corsOrigin), ...extraHeaders },
  });
}

export async function handleExternalApiOptions(
  request: NextRequest,
  token: AuthenticatedApiToken | null
): Promise<Response> {
  const origin = request.headers.get("origin");
  const allowed = await resolveAllowedOrigin(origin, token);
  return corsPreflightResponse(allowed);
}

export async function withExternalApiAuth(
  request: NextRequest,
  requiredScope: ApiTokenScope,
  endpoint: string,
  handler: (ctx: ExternalApiContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const clientIp = getClientIp(request);

  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return jsonWithCors(
      { error: "Request body too large" },
      413,
      await resolveAllowedOrigin(origin, null)
    );
  }

  const token = await authenticateExternalApiToken(
    request.headers.get("authorization")
  );

  if (!token) {
    const corsOrigin = await resolveAllowedOrigin(origin, null);
    return jsonWithCors({ error: labels.errors.unauthorized }, 401, corsOrigin);
  }

  const corsOrigin = await resolveAllowedOrigin(origin, token);
  if (origin && !corsOrigin) {
    await logExternalApiRequest({
      tokenId: token.id,
      endpoint,
      method: request.method,
      statusCode: 403,
      clientIp,
    });
    return jsonWithCors({ error: labels.errors.corsOriginDenied }, 403, null);
  }

  if (!token.scopes.includes(requiredScope)) {
    await logExternalApiRequest({
      tokenId: token.id,
      endpoint,
      method: request.method,
      statusCode: 403,
      clientIp,
    });
    return jsonWithCors(
      { error: labels.errors.apiScopeDenied },
      403,
      corsOrigin
    );
  }

  const dailyQuota = await checkDailyQuota({
    tokenId: token.id,
    dailyQuota: token.dailyQuota,
  });
  const dailyHdrs = dailyQuotaHeaders(dailyQuota);

  if (!dailyQuota.allowed) {
    await logExternalApiRequest({
      tokenId: token.id,
      endpoint,
      method: request.method,
      statusCode: 429,
      clientIp,
    });
    return jsonWithCors(
      { error: labels.errors.dailyQuotaExceeded },
      429,
      corsOrigin,
      dailyHdrs
    );
  }

  const rateKey = `ext-api:${token.id}`;
  const rate = checkRateLimit(rateKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  const rateHdrs = rateLimitHeaders(rate);

  if (!rate.allowed) {
    await logExternalApiRequest({
      tokenId: token.id,
      endpoint,
      method: request.method,
      statusCode: 429,
      clientIp,
    });
    return jsonWithCors(
      { error: labels.errors.tooManyRequests },
      429,
      corsOrigin,
      rateHdrs
    );
  }

  let response: NextResponse;
  try {
    response = await handler({ token, clientIp, corsOrigin });
  } catch (error) {
    console.error(`[external-api] ${endpoint} handler error:`, error);
    response = jsonWithCors(
      { error: labels.errors.serverError },
      500,
      corsOrigin,
      rateHdrs
    );
  }

  await logExternalApiRequest({
    tokenId: token.id,
    endpoint,
    method: request.method,
    statusCode: response.status,
    clientIp,
  });

  for (const [k, v] of Object.entries({
    ...corsHeaders(corsOrigin),
    ...rateHdrs,
    ...dailyHdrs,
  })) {
    response.headers.set(k, v);
  }

  return response;
}

export function getApiDiscoveryDocument(baseUrl: string) {
  return {
    name: "Next-Gamifikasi External API",
    version: "1.0.0",
    description:
      "Ollama proxy for external apps. Authenticate with Bearer token from Admin → API Tokens.",
    baseUrl: `${baseUrl}/api/v1`,
    authentication: {
      type: "Bearer",
      header: "Authorization: Bearer <token>",
    },
    rateLimit: {
      maxRequests: RATE_LIMIT_MAX,
      windowSeconds: RATE_LIMIT_WINDOW_MS / 1000,
    },
    dailyQuota: {
      description:
        "Per-token daily request limit set in Admin → API Tokens. Unlimited when not configured.",
      headers: {
        "X-Daily-Quota-Limit": "Configured daily limit (omitted when unlimited)",
        "X-Daily-Quota-Remaining": "Requests remaining today (WIB calendar day)",
        "X-Daily-Quota-Used": "Requests used today",
        "X-Daily-Quota-Reset": "Unix timestamp when the daily quota resets (midnight WIB)",
      },
    },
    endpoints: [
      {
        method: "GET",
        path: "/api/v1",
        scope: null,
        description: "API discovery (this document)",
      },
      {
        method: "GET",
        path: "/api/v1/models",
        scope: "models",
        description: "List available Ollama models",
      },
      {
        method: "POST",
        path: "/api/v1/chat",
        scope: "chat",
        description: "Chat completion (supports stream: true)",
        body: {
          messages: [{ role: "user", content: "Hello" }],
          stream: false,
          model: "optional override",
        },
      },
      {
        method: "POST",
        path: "/api/v1/generate",
        scope: "generate",
        description: "Text generation (supports stream: true)",
        body: {
          prompt: "Write a haiku about learning.",
          stream: false,
        },
      },
    ],
    errors: {
      401: "Invalid or expired token",
      403: "Scope denied or CORS origin not allowed",
      429: "Rate limit or daily quota exceeded",
      502: "Ollama upstream error",
    },
  };
}
