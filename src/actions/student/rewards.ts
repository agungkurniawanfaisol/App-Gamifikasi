"use server";

import { revalidatePath } from "next/cache";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import {
  getAchievementsWithProgress,
  markAchievementsNotified as markNotified,
} from "@/lib/achievement-engine";
import { getUserCertificates } from "@/lib/certificate-service";
import { getPremiumUnlockSummaries } from "@/lib/premium-access";

export async function getRewardsOverview() {
  const session = await requireStudent();
  const userId = getUserId(session);

  const [achievements, certificates, unlocks] = await Promise.all([
    getAchievementsWithProgress(userId),
    getUserCertificates(userId),
    getPremiumUnlockSummaries(userId),
  ]);

  return { achievements, certificates, unlocks };
}

export async function markAchievementsNotified(achievementIds: number[]) {
  const session = await requireStudent();
  const userId = getUserId(session);
  await markNotified(userId, achievementIds);
  revalidatePath("/dashboard/rewards");
}
