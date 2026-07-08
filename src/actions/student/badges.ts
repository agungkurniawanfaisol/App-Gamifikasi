"use server";

import { prisma } from "@/lib/prisma";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { revalidateTag } from "next/cache";
import {
  type BadgeKey,
  type BadgeProgress,
  type UserBadgeStats,
  BADGE_DEFINITIONS,
  buildUserBadgeStats,
  computeNewBadges,
  getBadgeByKey,
  getBadgeProgress,
  getNextUnlockBadge,
} from "@/lib/badges";

export type BadgeWithMeta = {
  badgeKey: BadgeKey;
  label: string;
  description: string;
  tier: string;
  unlockedAt: Date | null;
  notified: boolean;
  progress?: BadgeProgress;
};

export type BadgeOverview = {
  badges: BadgeWithMeta[];
  stats: UserBadgeStats;
  earnedCount: number;
  totalCount: number;
  nextUnlock: { key: BadgeKey; label: string; progress: BadgeProgress } | null;
  latestEarned: BadgeWithMeta | null;
};

async function fetchBadgeContext(userId: number) {
  const [user, progress, answers, levels] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    }),
    prisma.userProgress.findMany({
      where: { userId },
      select: {
        groupId: true,
        isGroupCompleted: true,
        completedAt: true,
        group: {
          select: { levelId: true, order: true },
        },
      },
    }),
    prisma.userAnswer.findMany({
      where: { userId },
      select: {
        isCorrect: true,
        scorePercent: true,
        contentItem: {
          select: { skill: true, groupId: true },
        },
      },
    }),
    prisma.level.findMany({
      select: { id: true, _count: { select: { groups: true } } },
    }),
  ]);

  const totalGroupsByLevel = new Map<number, number>();
  for (const level of levels) {
    totalGroupsByLevel.set(level.id, level._count.groups);
  }

  const stats = buildUserBadgeStats({
    user: user ?? { points: 0 },
    progress,
    answers,
    totalGroupsByLevel,
  });

  return { stats };
}

function mapBadgesWithProgress(
  stats: UserBadgeStats,
  userBadges: { badgeKey: string; unlockedAt: Date; notified: boolean }[]
): BadgeWithMeta[] {
  const badgeMap = new Map(
    userBadges.map((b) => [
      b.badgeKey,
      { unlockedAt: b.unlockedAt, notified: b.notified },
    ])
  );

  return BADGE_DEFINITIONS.map((def) => {
    const existing = badgeMap.get(def.key);
    return {
      badgeKey: def.key,
      label: def.label,
      description: def.description,
      tier: def.tier,
      unlockedAt: existing?.unlockedAt ?? null,
      notified: existing?.notified ?? false,
      progress: getBadgeProgress(def.key, stats),
    };
  });
}

async function computeAndSaveBadgesForUser(
  userId: number
): Promise<BadgeWithMeta[]> {
  const { stats } = await fetchBadgeContext(userId);

  const existingBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeKey: true },
  });
  const existingKeys = new Set<BadgeKey>(
    existingBadges.map((b) => b.badgeKey as BadgeKey)
  );

  const newlyUnlocked = computeNewBadges(stats, existingKeys);

  if (newlyUnlocked.length === 0) {
    return [];
  }

  await prisma.userBadge.createMany({
    data: newlyUnlocked.map((key) => ({
      userId,
      badgeKey: key,
    })),
    skipDuplicates: true,
  });

  revalidateTag(`student:${userId}:badges`);
  revalidateTag(`student:${userId}:dashboard`);

  return newlyUnlocked.map((key) => {
    const def = getBadgeByKey(key);
    return {
      badgeKey: key,
      label: def.label,
      description: def.description,
      tier: def.tier,
      unlockedAt: new Date(),
      notified: false,
      progress: getBadgeProgress(key, stats),
    };
  });
}

/**
 * Compute and save any newly unlocked badges for the current user.
 * Returns the list of NEWLY unlocked badges (for celebration modal).
 */
export async function computeAndSaveBadges(): Promise<BadgeWithMeta[]> {
  const session = await requireStudent();
  const userId = getUserId(session);
  return computeAndSaveBadgesForUser(userId);
}

/**
 * Backfill badges for users who already qualify but haven't been synced.
 */
export async function syncBadgesForUser(userId: number): Promise<void> {
  await computeAndSaveBadgesForUser(userId);
}

export async function getUserBadgeOverview(
  userId: number,
  options?: { sync?: boolean }
): Promise<BadgeOverview> {
  const session = await requireStudent();
  if (getUserId(session) !== userId) {
    throw new Error("Unauthorized");
  }

  if (options?.sync !== false) {
    await syncBadgesForUser(userId);
  }

  const { stats } = await fetchBadgeContext(userId);

  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    orderBy: { unlockedAt: "desc" },
  });

  const badges = mapBadgesWithProgress(stats, userBadges);
  const earned = badges.filter((b) => b.unlockedAt !== null);
  const existingKeys = new Set<BadgeKey>(
    earned.map((b) => b.badgeKey)
  );
  const next = getNextUnlockBadge(stats, existingKeys);

  return {
    badges,
    stats,
    earnedCount: earned.length,
    totalCount: badges.length,
    nextUnlock: next
      ? {
          key: next.key,
          label: getBadgeByKey(next.key).label,
          progress: next.progress,
        }
      : null,
    latestEarned: earned[0] ?? null,
  };
}

/**
 * Get all badges for the current user (earned + locked).
 */
export async function getUserBadges(): Promise<BadgeWithMeta[]> {
  const session = await requireStudent();
  const userId = getUserId(session);
  const overview = await getUserBadgeOverview(userId);
  return overview.badges;
}

/**
 * Get just the earned badges for the current user.
 */
export async function getEarnedBadges(): Promise<BadgeWithMeta[]> {
  const all = await getUserBadges();
  return all.filter((b) => b.unlockedAt !== null);
}

/**
 * Lightweight summary for dashboard preview card.
 */
export async function getBadgePreviewSummary(userId: number) {
  // Keep dashboard preview cheap; sync is handled by completion actions.
  const overview = await getUserBadgeOverview(userId, { sync: false });
  return {
    earnedCount: overview.earnedCount,
    totalCount: overview.totalCount,
    nextUnlock: overview.nextUnlock,
  };
}

/**
 * Mark badges as notified (after showing celebration modal).
 */
export async function markBadgesNotified(badgeKeys: BadgeKey[]) {
  const session = await requireStudent();
  const userId = getUserId(session);

  await prisma.userBadge.updateMany({
    where: { userId, badgeKey: { in: badgeKeys } },
    data: { notified: true },
  });
}
