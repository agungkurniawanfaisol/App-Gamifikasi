import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getProficiencySummary } from "@/lib/proficiency-queries";
import { getUserRankSummary } from "@/lib/ranking-queries";

/** Per-request dedupe: layout + page share one user shell query. */
export const getCachedShellUser = cache(async (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      points: true,
      profileImageUrl: true,
      role: true,
      proficiencyScore: true,
    },
  });
});

export const getCachedUserRankSummary = cache(getUserRankSummary);
export const getCachedProficiencySummary = cache(getProficiencySummary);

export const getCachedLevel = cache(async (levelId: number) => {
  return prisma.level.findUnique({ where: { id: levelId } });
});

export const getCachedPublishedGroup = cache(
  async (groupId: number, levelId: number) => {
    return prisma.learningGroup.findFirst({
      where: { id: groupId, levelId, isPublished: true },
      select: { id: true, title: true, levelId: true },
    });
  }
);
