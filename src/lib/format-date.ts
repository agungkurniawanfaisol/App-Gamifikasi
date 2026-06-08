const ADMIN_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
};

export const ADMIN_TIMEZONE_WIB = "Asia/Jakarta";

/** Stable SSR + client formatting (UTC) for admin timestamps. */
export function formatAdminDateTime(
  value: string | Date | null | undefined
): string {
  if (value == null || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", ADMIN_DATE_TIME_OPTIONS);
}

/** WIB display — use inside client components after mount (see FormattedDateTime). */
export function formatDateTimeWib(
  value: string | Date | null | undefined
): string {
  if (value == null || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: ADMIN_TIMEZONE_WIB,
  })} WIB`;
}

/** @deprecated Use formatAdminDateTime — kept for callers passing ISO strings. */
export function formatAdminDate(value: string | null | undefined): string {
  return formatAdminDateTime(value);
}

export function formatAdminDateShort(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}
