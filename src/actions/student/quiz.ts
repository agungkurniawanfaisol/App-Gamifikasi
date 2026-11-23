"use server";

import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { executeSubmitContentAnswer } from "@/lib/submit-content-answer";

export async function submitContentAnswer(
  contentItemId: number,
  answer: string,
  scorePercent?: number,
  subQuestionIndex = 0
) {
  const session = await requireStudent();
  const userId = getUserId(session);
  return executeSubmitContentAnswer(
    userId,
    contentItemId,
    answer,
    scorePercent,
    subQuestionIndex
  );
}

export async function updateAnswerFeedback(
  contentItemId: number,
  userId: number,
  feedback: string,
  subQuestionIndex = 0
) {
  const existing = await prisma.userAnswer.findFirst({
    where: { userId, contentItemId, subQuestionIndex },
  });
  if (!existing) return;

  await prisma.userAnswer.update({
    where: { id: existing.id },
    data: { aiFeedback: feedback },
  });
}
