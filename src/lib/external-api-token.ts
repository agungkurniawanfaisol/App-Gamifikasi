import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export const TOKEN_PREFIX = "ngf_live_";
export const TOKEN_PREFIX_LENGTH = 16;

export type ApiTokenScope = "chat" | "generate" | "models";

export const ALL_API_SCOPES: ApiTokenScope[] = ["chat", "generate", "models"];

export type AuthenticatedApiToken = {
  id: number;
  name: string;
  tokenPrefix: string;
  scopes: ApiTokenScope[];
  allowedOrigins: string[] | null;
  dailyQuota: number | null;
};

let tableReady: boolean | null = null;

export async function isExternalApiTokenTableReady(): Promise<boolean> {
  if (tableReady !== null) return tableReady;
  try {
    await prisma.$queryRaw`SELECT 1 FROM external_api_tokens LIMIT 1`;
    tableReady = true;
  } catch {
    tableReady = false;
  }
  return tableReady;
}

export function generateExternalApiToken(): { plaintext: string; prefix: string; hash: string } {
  const secret = randomBytes(32).toString("base64url");
  const plaintext = `${TOKEN_PREFIX}${secret}`;
  const prefix = plaintext.slice(0, TOKEN_PREFIX_LENGTH);
  const hash = hashToken(plaintext);
  return { plaintext, prefix, hash };
}

export function hashToken(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

export function parseScopes(raw: unknown): ApiTokenScope[] {
  if (!Array.isArray(raw)) return [...ALL_API_SCOPES];
  const valid = raw.filter(
    (s): s is ApiTokenScope =>
      s === "chat" || s === "generate" || s === "models"
  );
  return valid.length > 0 ? valid : [...ALL_API_SCOPES];
}

export function parseAllowedOrigins(raw: unknown): string[] | null {
  if (raw == null) return null;
  if (!Array.isArray(raw)) return [];
  return raw.filter((o): o is string => typeof o === "string" && o.length > 0);
}

export async function authenticateExternalApiToken(
  authorizationHeader: string | null
): Promise<AuthenticatedApiToken | null> {
  if (!(await isExternalApiTokenTableReady())) return null;
  if (!authorizationHeader?.startsWith("Bearer ")) return null;

  const plaintext = authorizationHeader.slice(7).trim();
  if (!plaintext.startsWith(TOKEN_PREFIX) || plaintext.length < 40) return null;

  const hash = hashToken(plaintext);
  const row = await prisma.externalApiToken.findUnique({
    where: { tokenHash: hash },
    select: {
      id: true,
      name: true,
      tokenPrefix: true,
      isActive: true,
      expiresAt: true,
      scopes: true,
      allowedOrigins: true,
      dailyQuota: true,
    },
  });

  if (!row || !row.isActive) return null;
  if (row.expiresAt && row.expiresAt < new Date()) return null;

  await prisma.externalApiToken.update({
    where: { id: row.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    id: row.id,
    name: row.name,
    tokenPrefix: row.tokenPrefix,
    scopes: parseScopes(row.scopes),
    allowedOrigins: parseAllowedOrigins(row.allowedOrigins),
    dailyQuota: row.dailyQuota,
  };
}
