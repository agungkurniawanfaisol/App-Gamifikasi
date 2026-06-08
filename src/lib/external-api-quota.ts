import { prisma } from "@/lib/prisma";

export const DAILY_QUOTA_TIMEZONE = "Asia/Jakarta";

export type DailyQuotaStatus = {
  allowed: boolean;
  limit: number | null;
  used: number;
  remaining: number | null;
  resetAt: Date;
};

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const offsetPart = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = offsetPart.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
  if (!match) return 0;
  const hours = Number.parseInt(match[1] ?? "0", 10);
  const minutes = Number.parseInt(match[2] ?? "0", 10);
  const sign = hours >= 0 ? 1 : -1;
  return (Math.abs(hours) * 60 + minutes) * 60 * 1000 * sign;
}

export function getStartOfDayInTimeZone(
  date: Date = new Date(),
  timeZone = DAILY_QUOTA_TIMEZONE
): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const ymd = formatter.format(date);
  const [year, month, day] = ymd.split("-").map(Number);
  const utcMidnight = Date.UTC(year!, month! - 1, day!, 0, 0, 0, 0);
  const offsetMs = getTimeZoneOffsetMs(new Date(utcMidnight), timeZone);
  return new Date(utcMidnight - offsetMs);
}

export function getNextMidnightInTimeZone(
  date: Date = new Date(),
  timeZone = DAILY_QUOTA_TIMEZONE
): Date {
  const start = getStartOfDayInTimeZone(date, timeZone);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export async function getDailyUsageCount(
  tokenId: number,
  timeZone = DAILY_QUOTA_TIMEZONE
): Promise<number> {
  const startOfDay = getStartOfDayInTimeZone(new Date(), timeZone);
  return prisma.externalApiTokenLog.count({
    where: {
      tokenId,
      createdAt: { gte: startOfDay },
    },
  });
}

export async function getDailyUsageCounts(
  tokenIds: number[],
  timeZone = DAILY_QUOTA_TIMEZONE
): Promise<Map<number, number>> {
  if (tokenIds.length === 0) return new Map();

  const startOfDay = getStartOfDayInTimeZone(new Date(), timeZone);
  const rows = await prisma.externalApiTokenLog.groupBy({
    by: ["tokenId"],
    where: {
      tokenId: { in: tokenIds },
      createdAt: { gte: startOfDay },
    },
    _count: { _all: true },
  });

  return new Map(rows.map((row) => [row.tokenId, row._count._all]));
}

export async function checkDailyQuota(input: {
  tokenId: number;
  dailyQuota: number | null;
}): Promise<DailyQuotaStatus> {
  const resetAt = getNextMidnightInTimeZone();
  const used = await getDailyUsageCount(input.tokenId);

  if (input.dailyQuota == null) {
    return {
      allowed: true,
      limit: null,
      used,
      remaining: null,
      resetAt,
    };
  }

  const remaining = Math.max(input.dailyQuota - used, 0);
  return {
    allowed: used < input.dailyQuota,
    limit: input.dailyQuota,
    used,
    remaining,
    resetAt,
  };
}

export function dailyQuotaHeaders(status: DailyQuotaStatus): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Daily-Quota-Reset": String(Math.ceil(status.resetAt.getTime() / 1000)),
    "X-Daily-Quota-Used": String(status.used),
  };

  if (status.limit != null) {
    headers["X-Daily-Quota-Limit"] = String(status.limit);
    headers["X-Daily-Quota-Remaining"] = String(status.remaining ?? 0);
  }

  return headers;
}
