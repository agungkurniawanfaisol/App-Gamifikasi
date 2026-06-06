"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { ContentItemType } from "@prisma/client";
import { getSubQuestionsFromItem } from "@/lib/content-item";

export async function getAdminDashboardStats() {
  await requireAdmin();

  const [userCount, groupCount, questionCount, levels, publishedByLevel] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.learningGroup.count(),
      prisma.groupContentItem.count({
        where: { type: ContentItemType.QUESTION },
      }),
      prisma.level.findMany({
        orderBy: { order: "asc" },
        include: {
          groups: {
            select: {
              id: true,
              isPublished: true,
              _count: { select: { contentItems: true } },
            },
          },
        },
      }),
      prisma.learningGroup.groupBy({
        by: ["levelId"],
        where: { isPublished: true },
        _count: { id: true },
      }),
    ]);

  const publishedMap = new Map(
    publishedByLevel.map((p) => [p.levelId, p._count.id])
  );

  return {
    userCount,
    groupCount,
    questionCount,
    levels: levels.map((level) => ({
      id: level.id,
      name: level.name,
      totalGroups: level.groups.length,
      publishedGroups: publishedMap.get(level.id) ?? 0,
    })),
  };
}

export async function getLevelGroupsStats(levelId: number) {
  await requireAdmin();
  return prisma.learningGroup.findMany({
    where: { levelId },
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: {
          contentItems: true,
        },
      },
      contentItems: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          order: true,
          title: true,
          questionText: true,
          skill: true,
          format: true,
          subQuestions: true,
          options: true,
          correctAnswer: true,
          expectedSpeech: true,
          audioUrl: true,
          explanation: true,
          essayRubric: true,
        },
      },
    },
  }).then((groups) =>
    groups.map((g) => {
      const materials = g.contentItems.filter(
        (i) => i.type === ContentItemType.MATERIAL
      ).length;
      const questions = g.contentItems.filter(
        (i) => i.type === ContentItemType.QUESTION
      ).length;
      return {
        id: g.id,
        title: g.title,
        isPublished: g.isPublished,
        order: g.order,
        _count: { materials, questions },
        contentItems: g.contentItems.map((item) => ({
          ...item,
          subQuestions: getSubQuestionsFromItem(item),
        })),
      };
    })
  );
}
