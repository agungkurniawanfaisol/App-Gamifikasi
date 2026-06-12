"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { groupEditPath } from "@/lib/content-routes";
import { ContentItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import type { SubQuestion } from "@/lib/sub-questions";
import {
  mirrorFirstSubToLegacyFields,
  serializeSubQuestionsForDb,
  validateSubQuestions,
} from "@/lib/sub-questions";
import {
  serializeMaterialAttachmentsForDb,
  type MaterialAttachment,
} from "@/lib/material-attachments";

function revalidateGroupEdit(levelId: number, groupId: number) {
  revalidatePath(`/admin/levels/${levelId}/groups/${groupId}/edit`, "layout");
}

async function nextOrder(groupId: number): Promise<number> {
  const max = await prisma.groupContentItem.aggregate({
    where: { groupId },
    _max: { order: true },
  });
  return (max._max.order ?? 0) + 1;
}

export async function createMaterialItem(
  groupId: number,
  levelId: number,
  data: { title: string; content: string; attachments?: MaterialAttachment[] }
) {
  await requireAdmin();
  const attachments = serializeMaterialAttachmentsForDb(data.attachments ?? []);
  await prisma.groupContentItem.create({
    data: {
      groupId,
      type: ContentItemType.MATERIAL,
      order: await nextOrder(groupId),
      title: data.title.trim() || "New Material",
      content: data.content,
      attachments,
    } as Parameters<typeof prisma.groupContentItem.create>[0]["data"],
  });
  revalidateGroupEdit(levelId, groupId);
  redirect(groupEditPath(levelId, groupId));
}

export async function updateMaterialItem(
  itemId: number,
  groupId: number,
  levelId: number,
  data: { title: string; content: string; attachments?: MaterialAttachment[] }
) {
  await requireAdmin();
  const attachments = serializeMaterialAttachmentsForDb(data.attachments ?? []);
  await prisma.groupContentItem.update({
    where: { id: itemId },
    data: {
      title: data.title.trim() || "Material",
      content: data.content,
      attachments,
    } as Parameters<typeof prisma.groupContentItem.update>[0]["data"],
  });
  revalidateGroupEdit(levelId, groupId);
  redirect(groupEditPath(levelId, groupId));
}

export type QuestionItemInput = {
  subQuestions: SubQuestion[];
};

export async function createQuestionItem(
  groupId: number,
  levelId: number,
  data: QuestionItemInput
) {
  await requireAdmin();
  const serialized = serializeSubQuestionsForDb(data.subQuestions);
  const error = validateSubQuestions(serialized);
  if (error) throw new Error(error);

  const legacy = mirrorFirstSubToLegacyFields(serialized);

  await prisma.groupContentItem.create({
    data: {
      groupId,
      type: ContentItemType.QUESTION,
      order: await nextOrder(groupId),
      subQuestions: serialized,
      ...legacy,
    },
  });
  revalidateGroupEdit(levelId, groupId);
  redirect(groupEditPath(levelId, groupId));
}

export async function updateQuestionItem(
  itemId: number,
  groupId: number,
  levelId: number,
  data: QuestionItemInput
) {
  await requireAdmin();
  const serialized = serializeSubQuestionsForDb(data.subQuestions);
  const error = validateSubQuestions(serialized);
  if (error) throw new Error(error);

  const legacy = mirrorFirstSubToLegacyFields(serialized);

  await prisma.groupContentItem.update({
    where: { id: itemId },
    data: {
      subQuestions: serialized,
      ...legacy,
    },
  });
  revalidateGroupEdit(levelId, groupId);
  redirect(groupEditPath(levelId, groupId));
}

export async function deleteContentItem(
  itemId: number,
  groupId: number,
  levelId: number
) {
  await requireAdmin();
  await prisma.groupContentItem.delete({ where: { id: itemId } });
  revalidateGroupEdit(levelId, groupId);
  redirect(groupEditPath(levelId, groupId));
}
