"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { buildLeaderboard, type LeaderboardResult } from "@/lib/ranking";
import { fetchLeaderboardUsers } from "@/lib/ranking-queries";

export async function getAdminLeaderboard(): Promise<LeaderboardResult> {
  await requireAdmin();

  const users = await fetchLeaderboardUsers();
  const mapped = users.map((user) => ({
    id: user.id,
    name: user.name,
    points: user.points,
    institution: user.institution,
    groupsCompleted: user._count.progress,
  }));

  return buildLeaderboard(mapped, -1);
}
