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

/** Serializable — no Lucide icons inside `unstable_cache`. */
type CachedProficiencySummary = {
  score: number;
};

async function fetchProficiencyScore(
  userId: number
): Promise<CachedProficiencySummary> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { proficiencyScore: true },
  });

  return { score: user?.proficiencyScore ?? 0 };
}

function hydrateProficiencySummary(
  cached: CachedProficiencySummary
): ProficiencySummary {
  const score = cached.score;
  return {
    score,
    level: getProficiencyLevel(score),
    progress: getProficiencyProgress(score),
  };
}

export async function getProficiencySummary(
  userId: number
): Promise<ProficiencySummary> {
  const cached = await unstable_cache(
    () => fetchProficiencyScore(userId),
    ["user-proficiency-summary-v2", String(userId)],
    {
      revalidate: 60,
      tags: [
        studentCacheTag(userId, "proficiency"),
        studentCacheTag(userId, "dashboard"),
      ],
    }
  )();

  return hydrateProficiencySummary(cached);
}
