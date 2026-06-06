import { ContentItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSubQuestionsFromItem } from "@/lib/content-item";
import { computeItemScorePercent } from "@/lib/sub-questions";

export type GroupScoreBreakdown = {
  scorePercent: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctSubAnswers: number;
  totalSubAnswers: number;
  skillSummary: Record<string, { correct: number; total: number }>;
};

export async function computeGroupScore(
  userId: number,
  groupId: number
): Promise<GroupScoreBreakdown> {
  const questionItems = await prisma.groupContentItem.findMany({
    where: { groupId, type: ContentItemType.QUESTION },
    orderBy: { order: "asc" },
  });

  if (questionItems.length === 0) {
    return {
      scorePercent: 100,
      totalQuestions: 0,
      answeredQuestions: 0,
      correctSubAnswers: 0,
      totalSubAnswers: 0,
      skillSummary: {},
    };
  }

  const answers = await prisma.userAnswer.findMany({
    where: {
      userId,
      contentItem: { groupId },
    },
    select: {
      contentItemId: true,
      subQuestionIndex: true,
      isCorrect: true,
      scorePercent: true,
    },
  });

  const itemScores: number[] = [];
  let answeredQuestions = 0;
  let correctSubAnswers = 0;
  let totalSubAnswers = 0;
  const skillSummary: Record<string, { correct: number; total: number }> = {};

  for (const item of questionItems) {
    const subQuestions = getSubQuestionsFromItem(item);
    if (subQuestions.length === 0) continue;

    const itemAnswers = answers.filter((a) => a.contentItemId === item.id);
    if (itemAnswers.length === 0) continue;

    answeredQuestions += 1;
    itemScores.push(computeItemScorePercent(subQuestions, itemAnswers));

    for (const sub of subQuestions) {
      const answer = itemAnswers.find((a) => a.subQuestionIndex === sub.order);
      if (!answer) continue;

      totalSubAnswers += 1;
      if (answer.isCorrect) correctSubAnswers += 1;

      const skillKey = sub.skill;
      if (!skillSummary[skillKey]) {
        skillSummary[skillKey] = { correct: 0, total: 0 };
      }
      skillSummary[skillKey].total += 1;
      if (answer.isCorrect) skillSummary[skillKey].correct += 1;
    }
  }

  const scorePercent =
    itemScores.length > 0
      ? Math.round(
          itemScores.reduce((sum, score) => sum + score, 0) / itemScores.length
        )
      : 0;

  return {
    scorePercent,
    totalQuestions: questionItems.length,
    answeredQuestions,
    correctSubAnswers,
    totalSubAnswers,
    skillSummary,
  };
}
