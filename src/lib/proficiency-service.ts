import { PointEventType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildProficiencyLevelKey,
  getProficiencyLevel,
  type ProficiencyLevelConfig,
  type ProficiencyLevelName,
} from "@/lib/proficiency";
import {
  evaluateAfterProficiencyLevelUp,
  type AchievementGrantResult,
} from "@/lib/achievement-engine";
import { toPrismaProficiencyLevel } from "@/lib/proficiency-map";

export type ProficiencyLevelUp = {
  from: ProficiencyLevelConfig;
  to: ProficiencyLevelConfig;
};

export type AddProficiencyResult = {
  gained: number;
  proficiencyScore: number;
  level: ProficiencyLevelConfig;
  levelUp: ProficiencyLevelUp | null;
  shouldCelebrate: boolean;
  achievementGrants: AchievementGrantResult[];
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function recordLevelUpEvent(
  userId: number,
  levelName: ProficiencyLevelName
): Promise<boolean> {
  try {
    await prisma.userPointEvent.create({
      data: {
        userId,
        eventType: PointEventType.PROFICIENCY_LEVEL_UP,
        eventKey: buildProficiencyLevelKey(levelName),
        points: 0,
        metadata: { level: levelName },
      },
    });
    return true;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return false;
    }
    throw error;
  }
}

export async function addProficiencyScore(
  userId: number,
  gained: number
): Promise<AddProficiencyResult> {
  if (gained <= 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { proficiencyScore: true },
    });
    const score = user?.proficiencyScore ?? 0;
    const level = getProficiencyLevel(score);
    return {
      gained: 0,
      proficiencyScore: score,
      level,
      levelUp: null,
      shouldCelebrate: false,
      achievementGrants: [],
    };
  }

  const before = await prisma.user.findUnique({
    where: { id: userId },
    select: { proficiencyScore: true },
  });
  const previousScore = before?.proficiencyScore ?? 0;
  const previousLevel = getProficiencyLevel(previousScore);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { proficiencyScore: { increment: gained } },
    select: { proficiencyScore: true },
  });

  const newLevel = getProficiencyLevel(updated.proficiencyScore);
  let levelUp: ProficiencyLevelUp | null = null;
  let shouldCelebrate = false;
  let achievementGrants: AchievementGrantResult[] = [];

  if (newLevel.name !== previousLevel.name) {
    levelUp = { from: previousLevel, to: newLevel };
    shouldCelebrate = await recordLevelUpEvent(userId, newLevel.name);
    if (shouldCelebrate) {
      achievementGrants = await evaluateAfterProficiencyLevelUp(
        userId,
        toPrismaProficiencyLevel(newLevel.name)
      );
    }
  }

  return {
    gained,
    proficiencyScore: updated.proficiencyScore,
    level: newLevel,
    levelUp,
    shouldCelebrate,
    achievementGrants,
  };
}
