"use server";

import { revalidatePath } from "next/cache";
import { ContentItemType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function getContentItemVersions(contentItemId: number) {
  await requireAdmin();
  return prisma.contentItemVersion.findMany({
    where: { contentItemId },
    orderBy: { versionNumber: "desc" },
    select: {
      id: true,
      versionNumber: true,
      createdAt: true,
    },
  });
}

export async function restoreContentItemVersion(
  versionId: number,
  contentItemId: number,
  groupId: number,
  levelId: number
) {
  await requireAdmin();

  const version = await prisma.contentItemVersion.findFirst({
    where: { id: versionId, contentItemId },
  });
  if (!version) return;

  const snapshot = version.snapshot as Prisma.JsonObject;
  const data: Prisma.GroupContentItemUpdateInput = {};

  if (typeof snapshot.title === "string") data.title = snapshot.title;
  if (typeof snapshot.content === "string") data.content = snapshot.content;
  if (typeof snapshot.questionText === "string") {
    data.questionText = snapshot.questionText;
  }
  if (snapshot.options !== undefined) data.options = snapshot.options as Prisma.InputJsonValue;
  if (typeof snapshot.correctAnswer === "string") {
    data.correctAnswer = snapshot.correctAnswer;
  }
  if (typeof snapshot.expectedSpeech === "string") {
    data.expectedSpeech = snapshot.expectedSpeech;
  }
  if (typeof snapshot.explanation === "string") {
    data.explanation = snapshot.explanation;
  }
  if (typeof snapshot.essayRubric === "string") {
    data.essayRubric = snapshot.essayRubric;
  }
  if (snapshot.subQuestions !== undefined) {
    data.subQuestions = snapshot.subQuestions as Prisma.InputJsonValue;
  }

  await prisma.groupContentItem.update({
    where: { id: contentItemId },
    data,
  });

  revalidatePath(`/admin/levels/${levelId}/groups/${groupId}/edit`);
  revalidatePath(
    `/admin/levels/${levelId}/groups/${groupId}/edit/items/${contentItemId}`
  );
}

export async function snapshotContentItemVersion(
  contentItemId: number,
  changedByUserId?: number
) {
  const item = await prisma.groupContentItem.findUnique({
    where: { id: contentItemId },
  });
  if (!item) return;

  const latest = await prisma.contentItemVersion.aggregate({
    where: { contentItemId },
    _max: { versionNumber: true },
  });

  await prisma.contentItemVersion.create({
    data: {
      contentItemId,
      versionNumber: (latest._max.versionNumber ?? 0) + 1,
      changedByUserId: changedByUserId ?? null,
      snapshot: {
        type: item.type,
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
      },
    },
  });
}
