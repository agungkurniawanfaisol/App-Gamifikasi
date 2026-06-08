import { isExternalApiTokenTableReady } from "@/lib/external-api-token";
import { DAILY_QUOTA_TIMEZONE } from "@/lib/external-api-quota";
import { prisma } from "@/lib/prisma";

export const API_TOKEN_AUDIT_PAGE_SIZE = 20;

export type AuditLogRow = {
  id: number;
  tokenId: number;
  endpoint: string;
  method: string;
  statusCode: number;
  clientIp: string | null;
  createdAt: Date;
};

export type AuditLogWithToken = AuditLogRow & {
  tokenName: string;
  tokenPrefix: string;
};

export type UsageChartPoint = {
  date: string;
  total: number;
  success: number;
  clientError: number;
  rateLimited: number;
};

export type PaginatedAuditLogs = {
  items: AuditLogWithToken[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function clampPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page, 1), totalPages);
}

export async function logExternalApiRequest(input: {
  tokenId: number;
  endpoint: string;
  method: string;
  statusCode: number;
  clientIp: string | null;
}): Promise<void> {
  if (!(await isExternalApiTokenTableReady())) return;
  try {
    await prisma.externalApiTokenLog.create({
      data: {
        tokenId: input.tokenId,
        endpoint: input.endpoint,
        method: input.method,
        statusCode: input.statusCode,
        clientIp: input.clientIp?.slice(0, 45) ?? null,
      },
    });
  } catch {
    /* audit failure must not break API */
  }
}

export async function getTokenAuditLogs(tokenId: number, limit = 20) {
  return prisma.externalApiTokenLog.findMany({
    where: { tokenId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      tokenId: true,
      endpoint: true,
      method: true,
      statusCode: true,
      clientIp: true,
      createdAt: true,
    },
  });
}

export async function listTokenAuditLogsPaginated(options?: {
  tokenId?: number;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedAuditLogs> {
  const pageSize = options?.pageSize ?? API_TOKEN_AUDIT_PAGE_SIZE;
  const requestedPage = Math.max(1, options?.page ?? 1);
  const where = options?.tokenId != null ? { tokenId: options.tokenId } : undefined;

  const total = await prisma.externalApiTokenLog.count({ where });
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const page = clampPage(requestedPage, totalPages);

  const rows = await prisma.externalApiTokenLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      tokenId: true,
      endpoint: true,
      method: true,
      statusCode: true,
      clientIp: true,
      createdAt: true,
      token: {
        select: {
          name: true,
          tokenPrefix: true,
        },
      },
    },
  });

  return {
    items: rows.map((row) => ({
      id: row.id,
      tokenId: row.tokenId,
      endpoint: row.endpoint,
      method: row.method,
      statusCode: row.statusCode,
      clientIp: row.clientIp,
      createdAt: row.createdAt,
      tokenName: row.token.name,
      tokenPrefix: row.token.tokenPrefix,
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getTokenUsageChart(
  tokenId?: number,
  days = 7
): Promise<UsageChartPoint[]> {
  const safeDays = Math.min(Math.max(days, 1), 90);
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - (safeDays - 1));

  const rows = tokenId
    ? await prisma.$queryRaw<
        Array<{
          day: Date;
          total: bigint;
          success: bigint;
          clientError: bigint;
          rateLimited: bigint;
        }>
      >`
        SELECT
          DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) AS day,
          COUNT(*) AS total,
          SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) AS success,
          SUM(CASE WHEN status_code >= 400 AND status_code < 429 THEN 1 ELSE 0 END) AS clientError,
          SUM(CASE WHEN status_code = 429 THEN 1 ELSE 0 END) AS rateLimited
        FROM external_api_token_logs
        WHERE token_id = ${tokenId}
          AND created_at >= ${startDate}
        GROUP BY day
        ORDER BY day ASC
      `
    : await prisma.$queryRaw<
        Array<{
          day: Date;
          total: bigint;
          success: bigint;
          clientError: bigint;
          rateLimited: bigint;
        }>
      >`
        SELECT
          DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) AS day,
          COUNT(*) AS total,
          SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) AS success,
          SUM(CASE WHEN status_code >= 400 AND status_code < 429 THEN 1 ELSE 0 END) AS clientError,
          SUM(CASE WHEN status_code = 429 THEN 1 ELSE 0 END) AS rateLimited
        FROM external_api_token_logs
        WHERE created_at >= ${startDate}
        GROUP BY day
        ORDER BY day ASC
      `;

  const byDay = new Map(
    rows.map((row) => [
      row.day.toISOString().slice(0, 10),
      {
        date: row.day.toISOString().slice(0, 10),
        total: Number(row.total),
        success: Number(row.success),
        clientError: Number(row.clientError),
        rateLimited: Number(row.rateLimited),
      },
    ])
  );

  const points: UsageChartPoint[] = [];
  for (let i = safeDays - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: DAILY_QUOTA_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const key = formatter.format(date);
    points.push(
      byDay.get(key) ?? {
        date: key,
        total: 0,
        success: 0,
        clientError: 0,
        rateLimited: 0,
      }
    );
  }

  return points;
}
