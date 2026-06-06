import { prisma } from "@/lib/prisma";
import {
  getProficiencyLevel,
  getProficiencyProgress,
  type ProficiencyLevelConfig,
  type ProficiencyProgress,
} from "@/lib/proficiency";

export type ProficiencySummary = {
  score: number;
  level: ProficiencyLevelConfig;
  progress: ProficiencyProgress;
};

export async function getProficiencySummary(
  userId: number
): Promise<ProficiencySummary> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { proficiencyScore: true },
  });

  const score = user?.proficiencyScore ?? 0;
  const level = getProficiencyLevel(score);
  const progress = getProficiencyProgress(score);

  return { score, level, progress };
}
