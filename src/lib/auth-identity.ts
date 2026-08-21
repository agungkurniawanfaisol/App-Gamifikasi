/** Prisma / MySQL signed INT upper bound for User.id */
export const APP_USER_ID_MAX = 2_147_483_647;

/**
 * True only for our DB user ids — not Google `sub` values, which are often
 * long numeric strings that break Prisma Int lookups on /dashboard.
 */
export function isAppUserId(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{1,10}$/.test(value)) return false;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n <= APP_USER_ID_MAX;
}

export function parseAppUserId(value: unknown): number | null {
  if (!isAppUserId(value)) return null;
  return Number(value);
}
