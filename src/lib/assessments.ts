import { AssessmentPhase } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AssessmentQuestionPayload = {
  id: number;
  groupId: number;
  phase: AssessmentPhase;
  order: number;
  questionText: string;
};

export type AssessmentAnswerRecord = {
  questionId: number;
  value: number;
};

export async function getGroupAssessmentQuestions(
  groupId: number,
  levelId: number
): Promise<{
  pretest: AssessmentQuestionPayload[];
  posttest: AssessmentQuestionPayload[];
}> {
  const assessmentQuestions = await prisma.groupAssessmentQuestion.findMany({
    where: {
      groupId,
      group: { levelId },
    },
    orderBy: [{ phase: "asc" }, { order: "asc" }],
    select: {
      id: true,
      groupId: true,
      phase: true,
      order: true,
      questionText: true,
    },
  });
  if (assessmentQuestions.length === 0) {
    return { pretest: [], posttest: [] };
  }

  const map = (q: (typeof assessmentQuestions)[number]): AssessmentQuestionPayload => ({
    id: q.id,
    groupId: q.groupId,
    phase: q.phase,
    order: q.order,
    questionText: q.questionText,
  });

  return {
    pretest: assessmentQuestions
      .filter((q) => q.phase === AssessmentPhase.PRETEST)
      .map(map),
    posttest: assessmentQuestions
      .filter((q) => q.phase === AssessmentPhase.POSTTEST)
      .map(map),
  };
}

export function isAssessmentPhaseComplete(
  questions: AssessmentQuestionPayload[],
  answers: AssessmentAnswerRecord[]
): boolean {
  if (questions.length === 0) return true;
  const answeredIds = new Set(answers.map((a) => a.questionId));
  return questions.every((q) => answeredIds.has(q.id));
}

export function isValidScaleValue(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}
