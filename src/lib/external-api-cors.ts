import { prisma } from "@/lib/prisma";
import type { AuthenticatedApiToken } from "@/lib/external-api-token";

const CORS_SETTING_KEY = "external_api_cors_origins";

export async function getGlobalCorsOrigins(): Promise<string[]> {
  try {
    const row = await prisma.appSetting.findUnique({
      where: { key: CORS_SETTING_KEY },
      select: { value: true },
    });
    if (!row?.value || !Array.isArray(row.value)) return [];
    return row.value.filter((o): o is string => typeof o === "string");
  } catch {
    return [];
  }
}

export async function setGlobalCorsOrigins(origins: string[]): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: CORS_SETTING_KEY },
    create: { key: CORS_SETTING_KEY, value: origins },
    update: { value: origins },
  });
}

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

export async function resolveAllowedOrigin(
  requestOrigin: string | null,
  token: AuthenticatedApiToken | null
): Promise<string | null> {
  if (!requestOrigin) return null;

  const normalized = normalizeOrigin(requestOrigin);
  const tokenOrigins = token?.allowedOrigins;
  const allowlist =
    tokenOrigins && tokenOrigins.length > 0
      ? tokenOrigins.map(normalizeOrigin)
      : (await getGlobalCorsOrigins()).map(normalizeOrigin);

  if (allowlist.length === 0) return null;
  return allowlist.includes(normalized) ? normalized : null;
}

export function corsHeaders(allowedOrigin: string | null): Record<string, string> {
  if (!allowedOrigin) return {};
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function corsPreflightResponse(allowedOrigin: string | null): Response {
  if (!allowedOrigin) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, {
    status: 204,
    headers: corsHeaders(allowedOrigin),
  });
}
