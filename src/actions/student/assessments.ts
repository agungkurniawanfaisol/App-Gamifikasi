"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { isValidScaleValue } from "@/lib/assessments";

export async function submitAssessmentAnswer(
  questionId: number,
  groupId: number,
  levelId: number,
  value: number
) {
  const session = await requireStudent();
  const userId = getUserId(session);

  if (!isValidScaleValue(value)) {
    throw new Error("Answer must be between 1 and 5");
  }

  const question = await prisma.groupAssessmentQuestion.findFirst({
    where: {
      id: questionId,
      groupId,
      group: { levelId, isPublished: true },
    },
    select: { id: true },
  });
  if (!question) throw new Error("Question not found");

  await prisma.userAssessmentAnswer.upsert({
    where: {
      userId_questionId: { userId, questionId },
    },
    create: { userId, questionId, value },
    update: { value },
  });

  revalidatePath(`/dashboard/learn/${levelId}/${groupId}`);
}
