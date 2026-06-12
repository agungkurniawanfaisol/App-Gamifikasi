import type { Prisma } from "@prisma/client";

const WIB_TIMEZONE = "Asia/Jakarta";

function getWibDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WIB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  return { year, month, day };
}

/** Instant for 00:00:00.000 on the given calendar day in WIB. */
function wibDayStart(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, -7, 0, 0, 0));
}

/** Start of today (00:00 WIB) for the given instant. */
export function startOfWibDay(date = new Date()): Date {
  const { year, month, day } = getWibDateParts(date);
  return wibDayStart(year, month, day);
}

/** End of today (23:59:59.999 WIB) for the given instant. */
export function endOfWibDay(date = new Date()): Date {
  const start = startOfWibDay(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

/** Start of the previous calendar day in WIB. */
export function startOfPreviousWibDay(date = new Date()): Date {
  const start = startOfWibDay(date);
  return new Date(start.getTime() - 24 * 60 * 60 * 1000);
}

export type ChatMonitorDatePreset = "all" | "today" | "yesterday" | "last7days";

export function chatMonitorDateRange(
  preset: ChatMonitorDatePreset,
  now = new Date()
): { from?: Date; to?: Date } {
  if (preset === "all") return {};

  if (preset === "today") {
    return { from: startOfWibDay(now) };
  }

  if (preset === "yesterday") {
    const yesterdayStart = startOfPreviousWibDay(now);
    return {
      from: yesterdayStart,
      to: new Date(startOfWibDay(now).getTime() - 1),
    };
  }

  const todayStart = startOfWibDay(now);
  return {
    from: new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000),
  };
}

export function userChatTodayWhere(
  userId: number,
  groupId?: number | null
): Prisma.ChatHistoryWhereInput {
  const where: Prisma.ChatHistoryWhereInput = {
    userId,
    createdAt: { gte: startOfWibDay() },
  };

  if (groupId !== undefined) {
    where.groupId = groupId;
  }

  return where;
}
