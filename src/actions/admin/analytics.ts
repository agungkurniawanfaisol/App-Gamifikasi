"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { buildAdminAnalyticsSnapshot } from "@/lib/admin-analytics";

export async function fetchAdminAnalytics() {
  await requireAdmin();
  return buildAdminAnalyticsSnapshot();
}
