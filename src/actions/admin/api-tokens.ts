"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId, requireAdmin } from "@/lib/auth-helpers";
import {
  getTokenAuditLogs,
  getTokenUsageChart,
  listTokenAuditLogsPaginated,
  type PaginatedAuditLogs,
  type UsageChartPoint,
} from "@/lib/external-api-audit";
import {
  getDailyUsageCount,
  getDailyUsageCounts,
} from "@/lib/external-api-quota";
import {
  ALL_API_SCOPES,
  generateExternalApiToken,
  isExternalApiTokenTableReady,
  parseAllowedOrigins,
  parseScopes,
  type ApiTokenScope,
} from "@/lib/external-api-token";
import {
  getGlobalCorsOrigins,
  setGlobalCorsOrigins,
} from "@/lib/external-api-cors";
import {
  canEncryptApiTokenSecrets,
  decryptApiTokenSecret,
  encryptApiTokenSecret,
} from "@/lib/api-token-vault";

export type ExternalApiTokenListItem = {
  id: number;
  name: string;
  tokenPrefix: string;
  isActive: boolean;
  scopes: ApiTokenScope[];
  allowedOrigins: string[] | null;
  dailyQuota: number | null;
  dailyUsed: number;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  hasStoredSecret: boolean;
};

export type ExternalApiTokenDetail = ExternalApiTokenListItem & {
  dailyRemaining: number | null;
};

const createSchema = z.object({
  name: z.string().trim().min(1).max(128),
  scopes: z.array(z.enum(["chat", "generate", "models"])).min(1),
  allowedOrigins: z.string().optional(),
  expiresAt: z.string().optional(),
  dailyQuota: z.string().optional(),
});

function parseOriginsInput(input?: string): string[] | null {
  if (!input?.trim()) return null;
  const origins = input
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : null;
}

function parseDailyQuotaInput(input?: string): number | null {
  if (!input?.trim()) return null;
  const value = Number.parseInt(input.trim(), 10);
  if (Number.isNaN(value) || value < 1) return null;
  return value;
}

export async function listExternalApiTokens(): Promise<ExternalApiTokenListItem[]> {
  await requireAdmin();
  if (!(await isExternalApiTokenTableReady())) return [];

  const rows = await prisma.externalApiToken.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      tokenPrefix: true,
      isActive: true,
      scopes: true,
      allowedOrigins: true,
      dailyQuota: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
      tokenSecretEnc: true,
    },
  });

  const usageMap = await getDailyUsageCounts(rows.map((row) => row.id));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    tokenPrefix: r.tokenPrefix,
    isActive: r.isActive,
    scopes: parseScopes(r.scopes),
    allowedOrigins: parseAllowedOrigins(r.allowedOrigins),
    dailyQuota: r.dailyQuota,
    lastUsedAt: r.lastUsedAt,
    expiresAt: r.expiresAt,
    createdAt: r.createdAt,
    dailyUsed: usageMap.get(r.id) ?? 0,
    hasStoredSecret: Boolean(r.tokenSecretEnc),
  }));
}

export async function getExternalApiTokenDetail(
  id: number
): Promise<ExternalApiTokenDetail | null> {
  await requireAdmin();
  if (!(await isExternalApiTokenTableReady())) return null;

  const row = await prisma.externalApiToken.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      tokenPrefix: true,
      isActive: true,
      scopes: true,
      allowedOrigins: true,
      dailyQuota: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
      tokenSecretEnc: true,
    },
  });

  if (!row) return null;

  const dailyUsed = await getDailyUsageCount(id);
  const dailyRemaining =
    row.dailyQuota != null ? Math.max(row.dailyQuota - dailyUsed, 0) : null;

  return {
    id: row.id,
    name: row.name,
    tokenPrefix: row.tokenPrefix,
    isActive: row.isActive,
    scopes: parseScopes(row.scopes),
    allowedOrigins: parseAllowedOrigins(row.allowedOrigins),
    dailyQuota: row.dailyQuota,
    lastUsedAt: row.lastUsedAt,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    dailyUsed,
    dailyRemaining,
    hasStoredSecret: Boolean(row.tokenSecretEnc),
  };
}

export async function createExternalApiToken(
  formData: FormData
): Promise<{ ok: true; plaintext: string } | { ok: false; error: string }> {
  const session = await requireAdmin();
  if (!(await isExternalApiTokenTableReady())) {
    return { ok: false, error: "API tokens table is not ready. Run database migrations." };
  }

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    scopes: formData.getAll("scopes"),
    allowedOrigins: formData.get("allowedOrigins")?.toString(),
    expiresAt: formData.get("expiresAt")?.toString(),
    dailyQuota: formData.get("dailyQuota")?.toString(),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { plaintext, prefix, hash } = generateExternalApiToken();
  const origins = parseOriginsInput(parsed.data.allowedOrigins);
  const expiresAt = parsed.data.expiresAt
    ? new Date(parsed.data.expiresAt)
    : null;

  let tokenSecretEnc: string | null = null;
  if (canEncryptApiTokenSecrets()) {
    try {
      tokenSecretEnc = encryptApiTokenSecret(plaintext);
    } catch {
      return { ok: false, error: "Could not encrypt token secret for storage." };
    }
  }

  await prisma.externalApiToken.create({
    data: {
      name: parsed.data.name,
      tokenPrefix: prefix,
      tokenHash: hash,
      tokenSecretEnc,
      scopes: parsed.data.scopes,
      allowedOrigins: origins === null ? Prisma.DbNull : origins,
      dailyQuota: parseDailyQuotaInput(parsed.data.dailyQuota),
      expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
      createdByUserId: getUserId(session),
    },
  });

  revalidatePath("/admin/api-tokens");
  return { ok: true, plaintext };
}

export async function toggleExternalApiToken(
  id: number,
  isActive: boolean
): Promise<void> {
  await requireAdmin();
  await prisma.externalApiToken.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/api-tokens");
  revalidatePath(`/admin/api-tokens/${id}/audit`);
}

export async function deleteExternalApiToken(id: number): Promise<void> {
  await requireAdmin();
  await prisma.externalApiToken.delete({ where: { id } });
  revalidatePath("/admin/api-tokens");
}

export async function rotateExternalApiToken(
  id: number
): Promise<{ ok: true; plaintext: string } | { ok: false; error: string }> {
  await requireAdmin();
  const { plaintext, prefix, hash } = generateExternalApiToken();

  let tokenSecretEnc: string | null = null;
  if (canEncryptApiTokenSecrets()) {
    try {
      tokenSecretEnc = encryptApiTokenSecret(plaintext);
    } catch {
      return { ok: false, error: "Could not encrypt token secret for storage." };
    }
  }

  await prisma.externalApiToken.update({
    where: { id },
    data: { tokenPrefix: prefix, tokenHash: hash, tokenSecretEnc },
  });

  revalidatePath("/admin/api-tokens");
  revalidatePath(`/admin/api-tokens/${id}/audit`);
  return { ok: true, plaintext };
}

export async function updateExternalApiTokenDailyQuota(
  id: number,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();

  const raw = formData.get("dailyQuota")?.toString() ?? "";
  const dailyQuota = parseDailyQuotaInput(raw);

  if (raw.trim() && dailyQuota == null) {
    return { ok: false, error: "Daily quota must be a positive number or empty for unlimited." };
  }

  try {
    await prisma.externalApiToken.update({
      where: { id },
      data: { dailyQuota },
    });
  } catch {
    return { ok: false, error: "Could not update daily quota." };
  }

  revalidatePath("/admin/api-tokens");
  revalidatePath(`/admin/api-tokens/${id}/audit`);
  return { ok: true };
}

export async function revealExternalApiTokenSecret(
  id: number
): Promise<{ ok: true; plaintext: string } | { ok: false; error: string }> {
  await requireAdmin();

  const row = await prisma.externalApiToken.findUnique({
    where: { id },
    select: { tokenSecretEnc: true },
  });

  if (!row?.tokenSecretEnc) {
    return {
      ok: false,
      error:
        "This token was created before secret storage was enabled. Rotate the token to store a recoverable copy.",
    };
  }

  try {
    return { ok: true, plaintext: decryptApiTokenSecret(row.tokenSecretEnc) };
  } catch {
    return {
      ok: false,
      error:
        "Could not decrypt the stored token. Check API_TOKEN_ENCRYPTION_KEY matches the key used when the token was created.",
    };
  }
}

export async function fetchTokenAuditLogs(tokenId: number) {
  await requireAdmin();
  return getTokenAuditLogs(tokenId);
}

export async function fetchTokenAuditPage(options: {
  tokenId?: number;
  page?: number;
}): Promise<PaginatedAuditLogs> {
  await requireAdmin();
  return listTokenAuditLogsPaginated(options);
}

export async function fetchTokenUsageChart(
  tokenId?: number,
  days = 7
): Promise<UsageChartPoint[]> {
  await requireAdmin();
  return getTokenUsageChart(tokenId, days);
}

export async function requireExternalApiTokenDetail(
  id: number
): Promise<ExternalApiTokenDetail> {
  const token = await getExternalApiTokenDetail(id);
  if (!token) notFound();
  return token;
}

export async function fetchGlobalCorsOrigins(): Promise<string[]> {
  await requireAdmin();
  return getGlobalCorsOrigins();
}

export async function saveGlobalCorsOriginsAction(
  formData: FormData
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const raw = formData.get("origins")?.toString() ?? "";
  const origins = raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  await setGlobalCorsOrigins(origins);
  revalidatePath("/admin/api-tokens");
  return { ok: true };
}

export async function listExternalApiTokenOptions(): Promise<
  Array<{ id: number; name: string; tokenPrefix: string }>
> {
  await requireAdmin();
  if (!(await isExternalApiTokenTableReady())) return [];

  return prisma.externalApiToken.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, tokenPrefix: true },
  });
}
