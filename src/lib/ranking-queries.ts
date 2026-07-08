import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { studentCacheTag } from "@/lib/revalidate-student";
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

export async function getPublicLeaderboardPreview(
  limit = 10
): Promise<LeaderboardResult> {
  const users = await fetchLeaderboardUsers();
  const mapped = users.map((user) => ({
    id: user.id,
    name: user.name,
    points: user.points,
    institution: user.institution,
    groupsCompleted: user._count.progress,
  }));

  const leaderboard = buildLeaderboard(mapped, -1);
  return {
    ...leaderboard,
    entries: leaderboard.entries.slice(0, limit),
  };
}

async function fetchUserRankSummary(
  userId: number
): Promise<UserRankSummary | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      isActive: true,
      points: true,
      _count: {
        select: {
          progress: { where: { isGroupCompleted: true } },
        },
      },
    },
  });
  if (!user || user.role !== "STUDENT" || !user.isActive) return null;

  const [aheadCount, totalParticipants] = await Promise.all([
    prisma.user.count({
      where: {
        role: "STUDENT",
        isActive: true,
        OR: [
          { points: { gt: user.points } },
          { AND: [{ points: user.points }, { id: { lt: user.id } }] },
        ],
      },
    }),
    prisma.user.count({
      where: { role: "STUDENT", isActive: true },
    }),
  ]);

  const points = user.points;
  const tier = getTier(points);
  const tierProgress = getTierProgress(points);

  return {
    rank: aheadCount + 1,
    totalParticipants,
    points,
    groupsCompleted: user._count.progress,
    tier,
    tierProgress,
  };
}

/**
 * Cheap rank for shell/sidebar: avoid scanning every student + `_count` joins.
 * Matches leaderboard order: points DESC, then id ASC.
 */
export async function getUserRankSummary(
  userId: number
): Promise<UserRankSummary | null> {
  return unstable_cache(
    () => fetchUserRankSummary(userId),
    ["user-rank-summary", String(userId)],
    {
      revalidate: 60,
      tags: [studentCacheTag(userId, "ranking"), studentCacheTag(userId, "dashboard")],
    }
  )();
}
