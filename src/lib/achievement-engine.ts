import {
  AchievementTriggerType,
  LevelName,
  PointEventType,
  Prisma,
  RewardType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseBonusPointsReward,
  parseCertificateReward,
  parseGroupCompleteConfig,
  parseLevelCompleteConfig,
  parsePremiumUnlockReward,
  parseProficiencyReachConfig,
  type AchievementEventContext,
  type PrismaProficiencyLevel,
} from "@/lib/achievement-definitions";
import { issueCertificate } from "@/lib/certificate-service";
import { getLevelLabel } from "@/lib/labels";
import { buildAchievementBonusKey } from "@/lib/points";
import { getPublishedGroupsForLevel } from "@/lib/progression";

const PROGRAM_COMPLETE_TRIGGER =
  "PROGRAM_COMPLETE" as AchievementTriggerType;

export type GrantedRewardResult =
  | { type: "BONUS_POINTS"; points: number }
  | {
      type: "CERTIFICATE";
      certificateId: number;
      certificateNumber: string;
      templateTitle: string;
    }
  | { type: "PREMIUM_UNLOCK"; levelId: number; levelLabel: string };

export type AchievementGrantResult = {
  achievementId: number;
  slug: string;
  title: string;
  description: string;
  iconKey: string;
  rewards: GrantedRewardResult[];
};

export async function getGroupsCompletedCount(userId: number): Promise<number> {
  return prisma.userProgress.count({
    where: { userId, isGroupCompleted: true },
  });
}

export async function isLevelComplete(
  userId: number,
  levelId: number
): Promise<boolean> {
  const groups = await getPublishedGroupsForLevel(levelId);
  if (groups.length === 0) return false;

  const completed = await prisma.userProgress.count({
    where: {
      userId,
      groupId: { in: groups.map((g) => g.id) },
      isGroupCompleted: true,
    },
  });

  return completed === groups.length;
}

export async function isProgramComplete(userId: number): Promise<boolean> {
  const levels = await prisma.level.findMany({ select: { id: true } });
  if (levels.length === 0) return false;

  const results = await Promise.all(
    levels.map((level) => isLevelComplete(userId, level.id))
  );
  return results.every(Boolean);
}

async function matchesAchievement(
  userId: number,
  definition: {
    triggerType: AchievementTriggerType;
    triggerConfig: unknown;
  },
  event: AchievementEventContext
): Promise<boolean> {
  if (definition.triggerType === AchievementTriggerType.GROUP_COMPLETE) {
    if (event.type !== "GROUP_COMPLETE") return false;
    const config = parseGroupCompleteConfig(definition.triggerConfig);
    if (!config) return false;
    const count = await getGroupsCompletedCount(userId);
    return count >= config.groupsCompleted;
  }

  if (definition.triggerType === AchievementTriggerType.LEVEL_COMPLETE) {
    if (event.type !== "LEVEL_COMPLETE") return false;
    const config = parseLevelCompleteConfig(definition.triggerConfig);
    if (!config) return false;
    const level = await prisma.level.findUnique({
      where: { id: event.levelId },
      select: { name: true },
    });
    if (!level || level.name !== config.levelName) return false;
    return isLevelComplete(userId, event.levelId);
  }

  if (definition.triggerType === AchievementTriggerType.PROFICIENCY_REACH) {
    if (event.type !== "PROFICIENCY_REACH") return false;
    const config = parseProficiencyReachConfig(definition.triggerConfig);
    if (!config) return false;
    return event.proficiencyLevel === config.proficiencyLevel;
  }

  if (definition.triggerType === PROGRAM_COMPLETE_TRIGGER) {
    if (event.type !== "PROGRAM_COMPLETE") return false;
    return isProgramComplete(userId);
  }

  return false;
}

async function grantRewardsForAchievement(
  tx: Prisma.TransactionClient,
  userId: number,
  achievement: {
    id: number;
    slug: string;
    title: string;
    rewards: {
      rewardType: RewardType;
      rewardConfig: unknown;
    }[];
  }
): Promise<GrantedRewardResult[]> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { name: true, proficiencyScore: true },
  });
  if (!user) return [];

  const granted: GrantedRewardResult[] = [];

  for (const reward of achievement.rewards) {
    if (reward.rewardType === RewardType.BONUS_POINTS) {
      const config = parseBonusPointsReward(reward.rewardConfig);
      if (!config) continue;

      try {
        await tx.userPointEvent.create({
          data: {
            userId,
            eventType: PointEventType.ACHIEVEMENT_BONUS,
            eventKey: buildAchievementBonusKey(achievement.slug),
            points: config.points,
            metadata: { achievementSlug: achievement.slug },
          },
        });
        await tx.user.update({
          where: { id: userId },
          data: { points: { increment: config.points } },
        });
        granted.push({ type: "BONUS_POINTS", points: config.points });
      } catch (error) {
        if (
          !(
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          )
        ) {
          throw error;
        }
      }
      continue;
    }

    if (reward.rewardType === RewardType.CERTIFICATE) {
      const config = parseCertificateReward(reward.rewardConfig);
      if (!config) continue;

      const template = await tx.certificateTemplate.findFirst({
        where: { slug: config.templateSlug, isActive: true },
        include: { level: true },
      });
      if (!template) continue;

      const cert = await issueCertificate(tx, {
        userId,
        templateSlug: config.templateSlug,
        achievementId: achievement.id,
        metadata: {
          userName: user.name,
          levelName: template.level?.name ?? "",
          levelLabel: template.level
            ? getLevelLabel(template.level.name)
            : template.title,
          completedAt: new Date().toISOString(),
          proficiencyScore: user.proficiencyScore,
        },
      });

      granted.push({
        type: "CERTIFICATE",
        certificateId: cert.id,
        certificateNumber: cert.certificateNumber,
        templateTitle: cert.templateTitle,
      });
      continue;
    }

    if (reward.rewardType === RewardType.PREMIUM_UNLOCK) {
      const config = parsePremiumUnlockReward(reward.rewardConfig);
      if (!config) continue;

      const level = await tx.level.findUnique({
        where: { id: config.levelId },
        select: { id: true, name: true },
      });
      if (!level) continue;

      const existing = await tx.userPremiumUnlock.findUnique({
        where: { userId_levelId: { userId, levelId: level.id } },
      });
      if (!existing) {
        await tx.userPremiumUnlock.create({
          data: {
            userId,
            levelId: level.id,
            sourceAchievementId: achievement.id,
          },
        });
      }

      granted.push({
        type: "PREMIUM_UNLOCK",
        levelId: level.id,
        levelLabel: getLevelLabel(level.name),
      });
    }
  }

  return granted;
}

export async function evaluateAchievements(
  userId: number,
  event: AchievementEventContext
): Promise<AchievementGrantResult[]> {
  const triggerType =
    event.type === "GROUP_COMPLETE"
      ? AchievementTriggerType.GROUP_COMPLETE
      : event.type === "LEVEL_COMPLETE"
        ? AchievementTriggerType.LEVEL_COMPLETE
        : event.type === "PROGRAM_COMPLETE"
          ? PROGRAM_COMPLETE_TRIGGER
          : AchievementTriggerType.PROFICIENCY_REACH;

  const [definitions, earned] = await Promise.all([
    prisma.achievementDefinition.findMany({
      where: { isActive: true, triggerType },
      include: { rewards: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
  ]);

  const earnedIds = new Set(earned.map((e) => e.achievementId));
  const results: AchievementGrantResult[] = [];

  for (const definition of definitions) {
    if (earnedIds.has(definition.id)) continue;
    const eligible = await matchesAchievement(userId, definition, event);
    if (!eligible) continue;

    const grantResult = await prisma.$transaction(async (tx) => {
      const existing = await tx.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: definition.id,
          },
        },
      });
      if (existing) return null;

      await tx.userAchievement.create({
        data: {
          userId,
          achievementId: definition.id,
        },
      });

      return grantRewardsForAchievement(tx, userId, definition);
    });

    if (grantResult !== null) {
      results.push({
        achievementId: definition.id,
        slug: definition.slug,
        title: definition.title,
        description: definition.description,
        iconKey: definition.iconKey,
        rewards: grantResult,
      });
      earnedIds.add(definition.id);
    }
  }

  return results;
}

export async function evaluateAfterGroupComplete(
  userId: number,
  levelId: number,
  groupId: number
): Promise<AchievementGrantResult[]> {
  const groupResults = await evaluateAchievements(userId, {
    type: "GROUP_COMPLETE",
    levelId,
    groupId,
  });

  const levelComplete = await isLevelComplete(userId, levelId);
  const levelResults = levelComplete
    ? await evaluateAchievements(userId, { type: "LEVEL_COMPLETE", levelId })
    : [];

  const programResults =
    levelComplete && (await isProgramComplete(userId))
      ? await evaluateAchievements(userId, { type: "PROGRAM_COMPLETE" })
      : [];

  return [...groupResults, ...levelResults, ...programResults];
}

export async function evaluateAfterProficiencyLevelUp(
  userId: number,
  proficiencyLevel: PrismaProficiencyLevel
): Promise<AchievementGrantResult[]> {
  return evaluateAchievements(userId, {
    type: "PROFICIENCY_REACH",
    proficiencyLevel,
  });
}

export type AchievementWithProgress = {
  id: number;
  slug: string;
  title: string;
  description: string;
  iconKey: string;
  triggerType: AchievementTriggerType;
  unlockedAt: Date | null;
  progress: { current: number; target: number; percent: number } | null;
};

export async function getAchievementsWithProgress(
  userId: number
): Promise<AchievementWithProgress[]> {
  const [definitions, earned, groupsCompleted, user] = await Promise.all([
    prisma.achievementDefinition.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.userAchievement.findMany({ where: { userId } }),
    getGroupsCompletedCount(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { proficiencyScore: true },
    }),
  ]);

  const earnedMap = new Map(
    earned.map((e) => [e.achievementId, e.unlockedAt])
  );

  const levels = await prisma.level.findMany({
    select: { id: true, name: true },
  });
  const levelByName = new Map(levels.map((l) => [l.name, l.id]));

  return Promise.all(
    definitions.map(async (def) => {
      const unlockedAt = earnedMap.get(def.id) ?? null;
      let progress: AchievementWithProgress["progress"] = null;

      if (!unlockedAt) {
        if (def.triggerType === AchievementTriggerType.GROUP_COMPLETE) {
          const config = parseGroupCompleteConfig(def.triggerConfig);
          if (config) {
            progress = {
              current: groupsCompleted,
              target: config.groupsCompleted,
              percent:
                config.groupsCompleted > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (groupsCompleted / config.groupsCompleted) * 100
                      )
                    )
                  : 0,
            };
          }
        } else if (def.triggerType === AchievementTriggerType.LEVEL_COMPLETE) {
          const config = parseLevelCompleteConfig(def.triggerConfig);
          if (config) {
            const levelId = levelByName.get(config.levelName);
            if (levelId) {
              const summary = await prisma.userProgress.count({
                where: {
                  userId,
                  isGroupCompleted: true,
                  group: { levelId, isPublished: true },
                },
              });
              const total = await prisma.learningGroup.count({
                where: { levelId, isPublished: true },
              });
              progress = {
                current: summary,
                target: total,
                percent:
                  total > 0 ? Math.round((summary / total) * 100) : 0,
              };
            }
          }
        } else if (def.triggerType === PROGRAM_COMPLETE_TRIGGER) {
          const completedLevels = await Promise.all(
            levels.map((level) => isLevelComplete(userId, level.id))
          );
          const current = completedLevels.filter(Boolean).length;
          const target = levels.length;
          progress = {
            current,
            target,
            percent: target > 0 ? Math.round((current / target) * 100) : 0,
          };
        }
      }

      return {
        id: def.id,
        slug: def.slug,
        title: def.title,
        description: def.description,
        iconKey: def.iconKey,
        triggerType: def.triggerType,
        unlockedAt,
        progress,
      };
    })
  );
}

export async function getNextAchievementHint(userId: number): Promise<string | null> {
  const achievements = await getAchievementsWithProgress(userId);
  const next = achievements.find(
    (a) => !a.unlockedAt && a.progress && a.progress.current < a.progress.target
  );
  if (!next?.progress) return null;

  const remaining = next.progress.target - next.progress.current;
  if (next.triggerType === AchievementTriggerType.GROUP_COMPLETE) {
    return remaining === 1
      ? `Complete 1 more group to earn "${next.title}"`
      : `Complete ${remaining} more groups to earn "${next.title}"`;
  }

  if (next.triggerType === AchievementTriggerType.LEVEL_COMPLETE) {
    return remaining === 1
      ? `Complete 1 more group in this level for "${next.title}"`
      : `Complete ${remaining} more groups in this level for "${next.title}"`;
  }

  return null;
}

export async function markAchievementsNotified(
  userId: number,
  achievementIds: number[]
): Promise<void> {
  if (achievementIds.length === 0) return;
  await prisma.userAchievement.updateMany({
    where: {
      userId,
      achievementId: { in: achievementIds },
    },
    data: { notified: true },
  });
}

export async function getUnnotifiedAchievementGrants(
  userId: number
): Promise<AchievementGrantResult[]> {
  const rows = await prisma.userAchievement.findMany({
    where: { userId, notified: false },
    include: {
      achievement: {
        include: { rewards: { orderBy: { sortOrder: "asc" } } },
      },
    },
    orderBy: { unlockedAt: "asc" },
  });

  return rows.map((row) => ({
    achievementId: row.achievementId,
    slug: row.achievement.slug,
    title: row.achievement.title,
    description: row.achievement.description,
    iconKey: row.achievement.iconKey,
    rewards: row.achievement.rewards.map((reward) => {
      if (reward.rewardType === RewardType.BONUS_POINTS) {
        const config = parseBonusPointsReward(reward.rewardConfig);
        return { type: "BONUS_POINTS" as const, points: config?.points ?? 0 };
      }
      if (reward.rewardType === RewardType.CERTIFICATE) {
        return {
          type: "CERTIFICATE" as const,
          certificateId: 0,
          certificateNumber: "",
          templateTitle: parseCertificateReward(reward.rewardConfig)?.templateSlug ?? "Certificate",
        };
      }
      const config = parsePremiumUnlockReward(reward.rewardConfig);
      return {
        type: "PREMIUM_UNLOCK" as const,
        levelId: config?.levelId ?? 0,
        levelLabel: "",
      };
    }),
  }));
}
