import { AchievementTriggerType, LevelName, Prisma, PrismaClient } from "@prisma/client";
import { SEED_SCALE } from "./config";

const TRIGGER_GROUP = "GROUP_COMPLETE" as const;
const TRIGGER_LEVEL = "LEVEL_COMPLETE" as const;
const TRIGGER_PROFICIENCY = "PROFICIENCY_REACH" as const;
const TRIGGER_PROGRAM = "PROGRAM_COMPLETE" as const;
const REWARD_POINTS = "BONUS_POINTS" as const;
const REWARD_CERT = "CERTIFICATE" as const;
const REWARD_PREMIUM = "PREMIUM_UNLOCK" as const;

const CERTIFICATES = [
  {
    slug: "cert-basic",
    title: "Basic English Certificate",
    subtitle: "Certificate of Completion — Basic Level",
    levelName: LevelName.BASIC,
  },
  {
    slug: "cert-intermediate",
    title: "Intermediate English Certificate",
    subtitle: "Certificate of Completion — Intermediate Level",
    levelName: LevelName.INTERMEDIATE,
  },
  {
    slug: "cert-hard",
    title: "Advanced English Certificate",
    subtitle: "Certificate of Completion — Advanced Level",
    levelName: LevelName.HARD,
  },
] as const;

const GRADUATION_CERTIFICATE = {
  slug: "cert-graduation",
  title: "Program Completion Certificate",
  subtitle: "Certificate of Completion — Full Program",
} as const;

const ACHIEVEMENTS = [
  {
    slug: "first-group-complete",
    title: "First Steps",
    description: "Complete your first learning group.",
    triggerType: TRIGGER_GROUP,
    triggerConfig: { groupsCompleted: 1 },
    iconKey: "footprints",
    sortOrder: 1,
    rewards: [{ rewardType: REWARD_POINTS, rewardConfig: { points: 15 } }],
  },
  {
    slug: "five-groups-complete",
    title: "Steady Learner",
    description: "Complete 5 learning groups.",
    triggerType: TRIGGER_GROUP,
    triggerConfig: { groupsCompleted: 5 },
    iconKey: "target",
    sortOrder: 2,
    rewards: [{ rewardType: REWARD_POINTS, rewardConfig: { points: 30 } }],
  },
  {
    slug: "ten-groups-complete",
    title: "Dedicated Student",
    description: "Complete 10 learning groups.",
    triggerType: TRIGGER_GROUP,
    triggerConfig: { groupsCompleted: 10 },
    iconKey: "flame",
    sortOrder: 3,
    rewards: [{ rewardType: REWARD_POINTS, rewardConfig: { points: 50 } }],
  },
  {
    slug: "level-basic-complete",
    title: "Basic Level Master",
    description: "Complete all groups in the Basic level.",
    triggerType: TRIGGER_LEVEL,
    triggerConfig: { levelName: LevelName.BASIC },
    iconKey: "book-open",
    sortOrder: 10,
    rewards: [
      {
        rewardType: REWARD_CERT,
        rewardConfig: { templateSlug: "cert-basic" },
      },
    ],
  },
  {
    slug: "level-intermediate-complete",
    title: "Intermediate Level Master",
    description: "Complete all groups in the Intermediate level.",
    triggerType: TRIGGER_LEVEL,
    triggerConfig: { levelName: LevelName.INTERMEDIATE },
    iconKey: "graduation-cap",
    sortOrder: 11,
    rewards: [
      {
        rewardType: REWARD_CERT,
        rewardConfig: { templateSlug: "cert-intermediate" },
      },
    ],
  },
  {
    slug: "level-hard-complete",
    title: "Advanced Level Master",
    description: "Complete all groups in the Advanced level.",
    triggerType: TRIGGER_LEVEL,
    triggerConfig: { levelName: LevelName.HARD },
    iconKey: "trophy",
    sortOrder: 12,
    rewards: [
      {
        rewardType: REWARD_CERT,
        rewardConfig: { templateSlug: "cert-hard" },
      },
    ],
  },
  {
    slug: "program-complete",
    title: "Program Graduate",
    description: "Complete all learning groups in every level.",
    triggerType: TRIGGER_PROGRAM,
    triggerConfig: {},
    iconKey: "medal",
    sortOrder: 13,
    rewards: [
      {
        rewardType: REWARD_CERT,
        rewardConfig: { templateSlug: "cert-graduation" },
      },
    ],
  },
  {
    slug: "proficiency-elementary",
    title: "Elementary Proficiency",
    description: "Reach Elementary proficiency to unlock premium Basic content.",
    triggerType: TRIGGER_PROFICIENCY,
    triggerConfig: { proficiencyLevel: "ELEMENTARY" },
    iconKey: "languages",
    sortOrder: 20,
    rewards: [{ rewardType: REWARD_PREMIUM, rewardConfig: { levelName: LevelName.BASIC } }],
  },
  {
    slug: "proficiency-intermediate",
    title: "Intermediate Proficiency",
    description: "Reach Intermediate proficiency to unlock premium Intermediate content.",
    triggerType: TRIGGER_PROFICIENCY,
    triggerConfig: { proficiencyLevel: "INTERMEDIATE" },
    iconKey: "graduation-cap",
    sortOrder: 21,
    rewards: [
      {
        rewardType: REWARD_PREMIUM,
        rewardConfig: { levelName: LevelName.INTERMEDIATE },
      },
    ],
  },
  {
    slug: "proficiency-upper-intermediate",
    title: "Upper Intermediate Proficiency",
    description: "Reach Upper Intermediate proficiency to unlock premium Advanced content.",
    triggerType: TRIGGER_PROFICIENCY,
    triggerConfig: { proficiencyLevel: "UPPER_INTERMEDIATE" },
    iconKey: "rocket",
    sortOrder: 22,
    rewards: [{ rewardType: REWARD_PREMIUM, rewardConfig: { levelName: LevelName.HARD } }],
  },
] as const;

export async function seedRewards(prisma: PrismaClient): Promise<void> {
  const levels = await prisma.level.findMany();
  const levelByName = new Map(levels.map((l) => [l.name, l.id]));

  for (const cert of CERTIFICATES) {
    const levelId = levelByName.get(cert.levelName);
    await prisma.certificateTemplate.upsert({
      where: { slug: cert.slug },
      update: {
        title: cert.title,
        subtitle: cert.subtitle,
        levelId: levelId ?? null,
        isActive: true,
      },
      create: {
        slug: cert.slug,
        title: cert.title,
        subtitle: cert.subtitle,
        levelId: levelId ?? null,
        designVariant: "classic",
      },
    });
  }

  await prisma.certificateTemplate.upsert({
    where: { slug: GRADUATION_CERTIFICATE.slug },
    update: {
      title: GRADUATION_CERTIFICATE.title,
      subtitle: GRADUATION_CERTIFICATE.subtitle,
      levelId: null,
      isActive: true,
    },
    create: {
      slug: GRADUATION_CERTIFICATE.slug,
      title: GRADUATION_CERTIFICATE.title,
      subtitle: GRADUATION_CERTIFICATE.subtitle,
      levelId: null,
      designVariant: "classic",
    },
  });

  for (const achievement of ACHIEVEMENTS) {
    const rewards = achievement.rewards.map((reward, index) => {
      const config = { ...reward.rewardConfig } as Record<string, unknown>;
      if ("levelName" in config && typeof config.levelName === "string") {
        config.levelId = levelByName.get(config.levelName as LevelName);
        delete config.levelName;
      }
      return {
        rewardType: reward.rewardType,
        rewardConfig: config as Prisma.InputJsonValue,
        sortOrder: index,
      };
    });

    await prisma.achievementDefinition.upsert({
      where: { slug: achievement.slug },
      update: {
        title: achievement.title,
        description: achievement.description,
        triggerType: achievement.triggerType as AchievementTriggerType,
        triggerConfig: achievement.triggerConfig,
        iconKey: achievement.iconKey,
        sortOrder: achievement.sortOrder,
        isActive: true,
        rewards: {
          deleteMany: {},
          create: rewards,
        },
      },
      create: {
        slug: achievement.slug,
        title: achievement.title,
        description: achievement.description,
        triggerType: achievement.triggerType as AchievementTriggerType,
        triggerConfig: achievement.triggerConfig,
        iconKey: achievement.iconKey,
        sortOrder: achievement.sortOrder,
        rewards: { create: rewards },
      },
    });
  }

  for (const level of levels) {
    const lastGroup = await prisma.learningGroup.findFirst({
      where: { levelId: level.id, isPublished: true },
      orderBy: { order: "desc" },
    });
    if (lastGroup && !lastGroup.isPremium) {
      await prisma.learningGroup.update({
        where: { id: lastGroup.id },
        data: { isPremium: true },
      });
    }

    const secondLast = await prisma.learningGroup.findFirst({
      where: {
        levelId: level.id,
        isPublished: true,
        order: { lte: Math.max(1, SEED_SCALE.groupsPerLevel - 1) },
      },
      orderBy: { order: "desc" },
      skip: 1,
    });
    if (secondLast && !secondLast.isPremium) {
      await prisma.learningGroup.update({
        where: { id: secondLast.id },
        data: { isPremium: true },
      });
    }
  }

  console.log("  ✅ Achievements, certificates, and premium groups seeded");
}
