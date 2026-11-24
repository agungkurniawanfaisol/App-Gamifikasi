import { ContentItemType, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSubQuestionsFromItem } from "@/lib/sub-questions";

export const STUDENT_ANSWER_REVIEW_PAGE_SIZE = 50;

export type StudentAnswerReviewRow = {
  userId: number;
  name: string;
  email: string;
  institution?: string | null;
  studentId?: string | null;
  correct: number;
  incorrect: number;
  unanswered: number;
  totalSlots: number;
};

export type StudentAnswerReviewRoster = {
  rows: StudentAnswerReviewRow[];
  totalStudents: number;
  page: number;
  pageSize: number;
  totalPages: number;
  expectedSlots: number;
};

async function countExpectedQuestionSlots(): Promise<number> {
  const items = await prisma.groupContentItem.findMany({
    where: {
      type: ContentItemType.QUESTION,
      group: { isPublished: true },
    },
    select: {
      id: true,
      questionText: true,
      skill: true,
      format: true,
      options: true,
      correctAnswer: true,
      expectedSpeech: true,
      audioUrl: true,
      explanation: true,
      essayRubric: true,
      subQuestions: true,
    },
  });

  return items.reduce(
    (sum, item) => sum + getSubQuestionsFromItem(item).length,
    0
  );
}

export async function buildStudentAnswerReviewRoster(
  page = 1,
  pageSize = STUDENT_ANSWER_REVIEW_PAGE_SIZE
): Promise<StudentAnswerReviewRoster> {
  const isAll = pageSize === 0 || pageSize >= 10000;
  const safePageSize = isAll ? 10000 : Math.min(Math.max(pageSize, 1), 500);
  const safePage = Math.max(page, 1);
  const skip = isAll ? 0 : (safePage - 1) * safePageSize;

  const studentWhere = { role: Role.STUDENT, isActive: true } as const;

  const [totalStudents, expectedSlots, students, answerAgg] = await Promise.all([
    prisma.user.count({ where: studentWhere }),
    countExpectedQuestionSlots(),
    prisma.user.findMany({
      where: studentWhere,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: isAll ? undefined : skip,
      take: isAll ? undefined : safePageSize,
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        studentId: true,
      },
    }),
    prisma.userAnswer.groupBy({
      by: ["userId", "isCorrect"],
      where: {
        user: studentWhere,
        contentItem: {
          type: ContentItemType.QUESTION,
          group: { isPublished: true },
        },
      },
      _count: { _all: true },
    }),
  ]);

  const countsByUser = new Map<number, { correct: number; incorrect: number }>();
  for (const row of answerAgg) {
    const current = countsByUser.get(row.userId) ?? { correct: 0, incorrect: 0 };
    if (row.isCorrect) current.correct += row._count._all;
    else current.incorrect += row._count._all;
    countsByUser.set(row.userId, current);
  }

  const rows: StudentAnswerReviewRow[] = students.map((student) => {
    const counts = countsByUser.get(student.id) ?? { correct: 0, incorrect: 0 };
    const answered = counts.correct + counts.incorrect;
    const unanswered = Math.max(0, expectedSlots - answered);
    return {
      userId: student.id,
      name: student.name,
      email: student.email,
      institution: student.institution,
      studentId: student.studentId,
      correct: counts.correct,
      incorrect: counts.incorrect,
      unanswered,
      totalSlots: expectedSlots,
    };
  });

  const totalPages = isAll
    ? 1
    : Math.max(1, Math.ceil(totalStudents / safePageSize));

  return {
    rows,
    totalStudents,
    page: safePage,
    pageSize: isAll ? totalStudents : safePageSize,
    totalPages,
    expectedSlots,
  };
}

export function aggregateContentAnswerStatsFromOverview(levels: Array<{
  groups: Array<{
    contentAnswers: {
      correct: number;
      incorrect: number;
      unanswered: number;
      totalSlots: number;
    };
  }>;
}>): {
  correct: number;
  incorrect: number;
  unanswered: number;
  totalSlots: number;
} {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  let totalSlots = 0;

  for (const level of levels) {
    for (const group of level.groups) {
      correct += group.contentAnswers.correct;
      incorrect += group.contentAnswers.incorrect;
      unanswered += group.contentAnswers.unanswered;
      totalSlots += group.contentAnswers.totalSlots;
    }
  }

  return { correct, incorrect, unanswered, totalSlots };
}
