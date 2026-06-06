import { prisma } from "@/lib/prisma";
import {
  buildLeaderboard,
  getTier,
  getTierProgress,
  type LeaderboardResult,
} from "@/lib/ranking";

export type UserRankSummary = {
  rank: number;
  totalParticipants: number;
  points: number;
  groupsCompleted: number;
  tier: ReturnType<typeof getTier>;
  tierProgress: ReturnType<typeof getTierProgress>;
};

export async function fetchLeaderboardUsers() {
  return prisma.user.findMany({
    where: { role: "STUDENT", isActive: true },
    orderBy: [{ points: "desc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      points: true,
      institution: true,
      _count: {
        select: {
          progress: { where: { isGroupCompleted: true } },
        },
      },
    },
  });
}

export async function getGlobalLeaderboard(
  currentUserId: number
): Promise<LeaderboardResult> {
  const users = await fetchLeaderboardUsers();
  const mapped = users.map((user) => ({
    id: user.id,
    name: user.name,
    points: user.points,
    institution: user.institution,
    groupsCompleted: user._count.progress,
  }));

  return buildLeaderboard(mapped, currentUserId);
}

export async function getUserRankSummary(
  userId: number
): Promise<UserRankSummary | null> {
  const leaderboard = await getGlobalLeaderboard(userId);
  const currentUser = leaderboard.currentUser;
  if (!currentUser) return null;

  const tier = getTier(currentUser.points);
  const tierProgress = getTierProgress(currentUser.points);

  return {
    rank: leaderboard.currentUserRank,
    totalParticipants: leaderboard.totalParticipants,
    points: currentUser.points,
    groupsCompleted: currentUser.groupsCompleted,
    tier,
    tierProgress,
  };
}
