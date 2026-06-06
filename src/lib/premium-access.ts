import { prisma } from "@/lib/prisma";

export async function getPremiumUnlockLevelIds(userId: number): Promise<Set<number>> {
  const unlocks = await prisma.userPremiumUnlock.findMany({
    where: { userId },
    select: { levelId: true },
  });
  return new Set(unlocks.map((u) => u.levelId));
}

export async function hasPremiumUnlockForLevel(
  userId: number,
  levelId: number
): Promise<boolean> {
  const unlock = await prisma.userPremiumUnlock.findUnique({
    where: { userId_levelId: { userId, levelId } },
    select: { id: true },
  });
  return unlock != null;
}

export async function canAccessPremiumGroup(
  userId: number,
  group: { isPremium: boolean; levelId: number }
): Promise<boolean> {
  if (!group.isPremium) return true;
  return hasPremiumUnlockForLevel(userId, group.levelId);
}

export async function getPremiumUnlockSummaries(userId: number) {
  const [unlocks, levels, premiumGroups] = await Promise.all([
    prisma.userPremiumUnlock.findMany({
      where: { userId },
      include: {
        achievement: { select: { title: true, slug: true } },
      },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.level.findMany({ orderBy: { order: "asc" } }),
    prisma.learningGroup.findMany({
      where: { isPublished: true, isPremium: true },
      select: { id: true, levelId: true, title: true, order: true },
      orderBy: [{ levelId: "asc" }, { order: "asc" }],
    }),
  ]);

  const unlockedLevelIds = new Set(unlocks.map((u) => u.levelId));

  const summaries = await Promise.all(
    levels.map(async (level) => {
      const groups = premiumGroups.filter((g) => g.levelId === level.id);
      const unlocked = unlockedLevelIds.has(level.id);
      const requirement = unlocked
        ? null
        : await getPremiumRequirementForLevel(level.id);

      return {
        level,
        unlocked,
        unlockedAt: unlocks.find((u) => u.levelId === level.id)?.unlockedAt ?? null,
        achievementTitle:
          unlocks.find((u) => u.levelId === level.id)?.achievement.title ??
          requirement?.title ??
          null,
        requirementTitle: requirement?.title ?? null,
        premiumGroups: groups,
      };
    })
  );

  return summaries;
}

export async function getPremiumRequirementForLevel(levelId: number) {
  const achievements = await prisma.achievementDefinition.findMany({
    where: {
      isActive: true,
      triggerType: "PROFICIENCY_REACH",
      rewards: { some: { rewardType: "PREMIUM_UNLOCK" } },
    },
    include: { rewards: true },
  });

  for (const achievement of achievements) {
    for (const reward of achievement.rewards) {
      if (reward.rewardType !== "PREMIUM_UNLOCK") continue;
      const config = reward.rewardConfig as { levelId?: number };
      if (config.levelId === levelId) {
        return {
          title: achievement.title,
          description: achievement.description,
          triggerConfig: achievement.triggerConfig,
        };
      }
    }
  }

  return null;
}
