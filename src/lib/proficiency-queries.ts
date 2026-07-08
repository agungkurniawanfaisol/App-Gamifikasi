import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { studentCacheTag } from "@/lib/revalidate-student";
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

async function fetchProficiencySummary(
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

export async function getProficiencySummary(
  userId: number
): Promise<ProficiencySummary> {
  return unstable_cache(
    () => fetchProficiencySummary(userId),
    ["user-proficiency-summary", String(userId)],
    {
      revalidate: 60,
      tags: [
        studentCacheTag(userId, "proficiency"),
        studentCacheTag(userId, "dashboard"),
      ],
    }
  )();
}
