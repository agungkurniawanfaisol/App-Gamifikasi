"use server";

import { revalidatePath } from "next/cache";
import { AssessmentPhase } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

function revalidateGroupEdit(levelId: number, groupId: number) {
  revalidatePath(`/admin/levels/${levelId}/groups/${groupId}/edit`, "layout");
}

async function nextAssessmentOrder(
  groupId: number,
  phase: AssessmentPhase
): Promise<number> {
  const max = await prisma.groupAssessmentQuestion.aggregate({
    where: { groupId, phase },
    _max: { order: true },
  });
  return (max._max.order ?? 0) + 1;
}

async function assertGroup(groupId: number, levelId: number) {
  const group = await prisma.learningGroup.findFirst({
    where: { id: groupId, levelId },
    select: { id: true },
  });
  if (!group) throw new Error("Group not found");
}

export async function createAssessmentQuestion(
  groupId: number,
  levelId: number,
  phase: AssessmentPhase,
  questionText: string
) {
  await requireAdmin();
  await assertGroup(groupId, levelId);

  const text = questionText.trim();
  if (!text) throw new Error("Question text is required");

  await prisma.groupAssessmentQuestion.create({
    data: {
      groupId,
      phase,
      order: await nextAssessmentOrder(groupId, phase),
      questionText: text,
    },
  });

  revalidateGroupEdit(levelId, groupId);
}

export async function updateAssessmentQuestion(
  questionId: number,
  groupId: number,
  levelId: number,
  questionText: string
) {
  await requireAdmin();
  await assertGroup(groupId, levelId);

  const text = questionText.trim();
  if (!text) throw new Error("Question text is required");

  await prisma.groupAssessmentQuestion.updateMany({
    where: { id: questionId, groupId },
    data: { questionText: text },
  });

  revalidateGroupEdit(levelId, groupId);
}

export async function deleteAssessmentQuestion(
  questionId: number,
  groupId: number,
  levelId: number
) {
  await requireAdmin();
  await assertGroup(groupId, levelId);

  await prisma.groupAssessmentQuestion.deleteMany({
    where: { id: questionId, groupId },
  });

  revalidateGroupEdit(levelId, groupId);
}
