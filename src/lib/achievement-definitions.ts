import {
  AchievementTriggerType,
  LevelName,
  RewardType,
} from "@prisma/client";

export type PrismaProficiencyLevel =
  | "BEGINNER"
  | "ELEMENTARY"
  | "INTERMEDIATE"
  | "UPPER_INTERMEDIATE"
  | "ADVANCED";

export type GroupCompleteTriggerConfig = {
  groupsCompleted: number;
};

export type LevelCompleteTriggerConfig = {
  levelName: LevelName;
};

export type ProficiencyReachTriggerConfig = {
  proficiencyLevel: PrismaProficiencyLevel;
};

export type BonusPointsRewardConfig = {
  points: number;
};

export type CertificateRewardConfig = {
  templateSlug: string;
};

export type PremiumUnlockRewardConfig = {
  levelId: number;
};

export type AchievementEventContext =
  | { type: "GROUP_COMPLETE"; levelId: number; groupId: number }
  | { type: "LEVEL_COMPLETE"; levelId: number }
  | { type: "PROFICIENCY_REACH"; proficiencyLevel: PrismaProficiencyLevel };

export function parseGroupCompleteConfig(
  raw: unknown
): GroupCompleteTriggerConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const config = raw as Record<string, unknown>;
  if (typeof config.groupsCompleted !== "number") return null;
  return { groupsCompleted: config.groupsCompleted };
}

export function parseLevelCompleteConfig(
  raw: unknown
): LevelCompleteTriggerConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const config = raw as Record<string, unknown>;
  if (typeof config.levelName !== "string") return null;
  if (!Object.values(LevelName).includes(config.levelName as LevelName)) {
    return null;
  }
  return { levelName: config.levelName as LevelName };
}

export function parseProficiencyReachConfig(
  raw: unknown
): ProficiencyReachTriggerConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const config = raw as Record<string, unknown>;
  if (typeof config.proficiencyLevel !== "string") return null;
  if (
    !Object.values({
      BEGINNER: "BEGINNER",
      ELEMENTARY: "ELEMENTARY",
      INTERMEDIATE: "INTERMEDIATE",
      UPPER_INTERMEDIATE: "UPPER_INTERMEDIATE",
      ADVANCED: "ADVANCED",
    }).includes(config.proficiencyLevel as string)
  ) {
    return null;
  }
  return { proficiencyLevel: config.proficiencyLevel as PrismaProficiencyLevel };
}

export function parseBonusPointsReward(
  raw: unknown
): BonusPointsRewardConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const config = raw as Record<string, unknown>;
  if (typeof config.points !== "number" || config.points <= 0) return null;
  return { points: config.points };
}

export function parseCertificateReward(
  raw: unknown
): CertificateRewardConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const config = raw as Record<string, unknown>;
  if (typeof config.templateSlug !== "string") return null;
  return { templateSlug: config.templateSlug };
}

export function parsePremiumUnlockReward(
  raw: unknown
): PremiumUnlockRewardConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const config = raw as Record<string, unknown>;
  if (typeof config.levelId !== "number") return null;
  return { levelId: config.levelId };
}

export function eventMatchesTrigger(
  triggerType: AchievementTriggerType,
  triggerConfig: unknown,
  event: AchievementEventContext
): boolean {
  if (triggerType === AchievementTriggerType.GROUP_COMPLETE) {
    if (event.type !== "GROUP_COMPLETE") return false;
    const config = parseGroupCompleteConfig(triggerConfig);
    return config !== null;
  }

  if (triggerType === AchievementTriggerType.LEVEL_COMPLETE) {
    if (event.type !== "LEVEL_COMPLETE") return false;
    const config = parseLevelCompleteConfig(triggerConfig);
    if (!config) return false;
    return event.levelId !== undefined;
  }

  if (triggerType === AchievementTriggerType.PROFICIENCY_REACH) {
    if (event.type !== "PROFICIENCY_REACH") return false;
    const config = parseProficiencyReachConfig(triggerConfig);
    if (!config) return false;
    return event.proficiencyLevel === config.proficiencyLevel;
  }

  return false;
}

export function prismaProficiencyToAppLevel(
  level: PrismaProficiencyLevel
): string {
  return level.toLowerCase();
}
