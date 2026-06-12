"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ContentItemType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

type ExportedContentItem = {
  type: ContentItemType;
  order: number;
  title: string | null;
  content: string | null;
  questionText: string | null;
  skill: string | null;
  format: string | null;
  options: Prisma.JsonValue;
  correctAnswer: string | null;
  expectedSpeech: string | null;
  audioUrl: string | null;
  explanation: string | null;
  essayRubric: string | null;
  subQuestions: Prisma.JsonValue;
};

export type ExportedGroupJson = {
  title: string;
  isPremium: boolean;
  items: ExportedContentItem[];
};

export async function exportGroupJson(groupId: number): Promise<ExportedGroupJson> {
  await requireAdmin();
  const group = await prisma.learningGroup.findUnique({
    where: { id: groupId },
    include: {
      contentItems: { orderBy: { order: "asc" } },
    },
  });
  if (!group) {
    return { title: "", isPremium: false, items: [] };
  }

  return {
    title: group.title,
    isPremium: group.isPremium,
    items: group.contentItems.map((item) => ({
      type: item.type,
      order: item.order,
      title: item.title,
      content: item.content,
      questionText: item.questionText,
      skill: item.skill,
      format: item.format,
      options: item.options,
      correctAnswer: item.correctAnswer,
      expectedSpeech: item.expectedSpeech,
      audioUrl: item.audioUrl,
      explanation: item.explanation,
      essayRubric: item.essayRubric,
      subQuestions: item.subQuestions,
    })),
  };
}

export async function importGroupJson(
  levelId: number,
  payload: ExportedGroupJson
) {
  await requireAdmin();
  if (!payload?.title?.trim()) return;

  const maxOrder = await prisma.learningGroup.aggregate({
    where: { levelId },
    _max: { order: true },
  });

  const group = await prisma.learningGroup.create({
    data: {
      levelId,
      title: payload.title.trim(),
      order: (maxOrder._max.order ?? 0) + 1,
      isPremium: Boolean(payload.isPremium),
      contentItems: {
        create: (payload.items ?? []).map((item) => ({
          type: item.type,
          order: item.order,
          title: item.title,
          content: item.content,
          questionText: item.questionText,
          skill: item.skill as never,
          format: item.format as never,
          options: item.options as Prisma.InputJsonValue,
          correctAnswer: item.correctAnswer,
          expectedSpeech: item.expectedSpeech,
          audioUrl: item.audioUrl,
          explanation: item.explanation,
          essayRubric: item.essayRubric,
          subQuestions: item.subQuestions as Prisma.InputJsonValue,
        })),
      },
    },
  });

  revalidatePath(`/admin/levels/${levelId}/groups`);
  redirect(`/admin/levels/${levelId}/groups/${group.id}/edit`);
}

export async function cloneGroup(groupId: number, levelId: number) {
  await requireAdmin();
  const data = await exportGroupJson(groupId);
  const maxOrder = await prisma.learningGroup.aggregate({
    where: { levelId },
    _max: { order: true },
  });

  const group = await prisma.learningGroup.create({
    data: {
      levelId,
      title: `${data.title} (copy)`,
      order: (maxOrder._max.order ?? 0) + 1,
      isPremium: data.isPremium,
      contentItems: {
        create: data.items.map((item) => ({
          type: item.type,
          order: item.order,
          title: item.title,
          content: item.content,
          questionText: item.questionText,
          skill: item.skill as never,
          format: item.format as never,
          options: item.options as Prisma.InputJsonValue,
          correctAnswer: item.correctAnswer,
          expectedSpeech: item.expectedSpeech,
          audioUrl: item.audioUrl,
          explanation: item.explanation,
          essayRubric: item.essayRubric,
          subQuestions: item.subQuestions as Prisma.InputJsonValue,
        })),
      },
    },
  });

  revalidatePath(`/admin/levels/${levelId}/groups`);
  redirect(`/admin/levels/${levelId}/groups/${group.id}/edit`);
}
