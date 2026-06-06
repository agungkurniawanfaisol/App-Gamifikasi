import { ContentItemType, QuestionFormat, QuestionSkill } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSubQuestionsFromItem } from "@/lib/sub-questions";
import {
  DAILY_CHALLENGE_QUESTION_COUNT,
  DAILY_CHALLENGE_SLUG,
  getPeriodBounds,
} from "@/lib/challenge";

export type DailyQuestionSlot = {
  contentItemId: number;
  subQuestionIndex: number;
};

function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(31, hash) + seed.charCodeAt(i);
    hash |= 0;
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  const random = createSeededRandom(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function buildQuestionPool(): Promise<DailyQuestionSlot[]> {
  const items = await prisma.groupContentItem.findMany({
    where: {
      type: ContentItemType.QUESTION,
      group: { isPublished: true },
    },
    select: {
      id: true,
      subQuestions: true,
      questionText: true,
      skill: true,
      format: true,
      options: true,
      correctAnswer: true,
      expectedSpeech: true,
      audioUrl: true,
      explanation: true,
      essayRubric: true,
    },
  });

  const pool: DailyQuestionSlot[] = [];

  for (const item of items) {
    const subQuestions = getSubQuestionsFromItem(item);
    if (subQuestions.length === 0) continue;

    subQuestions.forEach((_, index) => {
      pool.push({ contentItemId: item.id, subQuestionIndex: index });
    });
  }

  return pool;
}

export async function ensureDailyChallengeQuestions(
  userId: number,
  periodId: number,
  periodKey: string
): Promise<void> {
  const existingCount = await prisma.userDailyChallengeQuestion.count({
    where: { userId, periodId },
  });

  if (existingCount > 0) return;

  const pool = await buildQuestionPool();
  if (pool.length === 0) return;

  const selected = shuffleWithSeed(
    pool,
    `${userId}:${periodKey}`
  ).slice(0, DAILY_CHALLENGE_QUESTION_COUNT);

  await prisma.userDailyChallengeQuestion.createMany({
    data: selected.map((slot, orderIndex) => ({
      userId,
      periodId,
      contentItemId: slot.contentItemId,
      subQuestionIndex: slot.subQuestionIndex,
      orderIndex,
    })),
  });
}

export async function getDailyChallengePeriod(userId: number) {
  const template = await prisma.challengeTemplate.findUnique({
    where: { slug: DAILY_CHALLENGE_SLUG },
  });

  if (!template?.isActive) {
    return null;
  }

  const now = new Date();
  const bounds = getPeriodBounds(template.recurrence, now);

  const period = await prisma.challengePeriod.upsert({
    where: {
      templateId_periodKey: {
        templateId: template.id,
        periodKey: bounds.periodKey,
      },
    },
    create: {
      templateId: template.id,
      periodKey: bounds.periodKey,
      startsAt: bounds.startsAt,
      endsAt: bounds.endsAt,
    },
    update: {},
    include: { template: true },
  });

  await ensureDailyChallengeQuestions(userId, period.id, bounds.periodKey);

  return period;
}

export async function getDailyChallengeAnsweredCount(
  userId: number,
  periodId: number
): Promise<number> {
  return prisma.userDailyChallengeQuestion.count({
    where: { userId, periodId, isAnswered: true },
  });
}

export type DailyChallengeQuestionView = {
  assignmentId: number;
  orderIndex: number;
  contentItemId: number;
  subQuestionIndex: number;
  isAnswered: boolean;
  isCorrect: boolean | null;
  groupTitle: string;
  levelId: number;
  groupId: number;
  questionText: string;
  skill: QuestionSkill | null;
  format: QuestionFormat;
  options: string[] | null;
  expectedSpeech: string | null;
  correctAnswer: string | null;
  audioUrl: string | null;
  essayRubric: string | null;
};

export async function getDailyChallengeQuestions(
  userId: number
): Promise<{
  periodId: number;
  endsAt: Date;
  pointReward: number;
  isComplete: boolean;
  answeredCount: number;
  totalCount: number;
  questions: DailyChallengeQuestionView[];
} | null> {
  const period = await getDailyChallengePeriod(userId);
  if (!period) return null;

  const assignments = await prisma.userDailyChallengeQuestion.findMany({
    where: { userId, periodId: period.id },
    orderBy: { orderIndex: "asc" },
    include: {
      contentItem: {
        include: {
          group: {
            select: {
              id: true,
              title: true,
              levelId: true,
            },
          },
        },
      },
    },
  });

  const progress = await prisma.userChallengeProgress.findUnique({
    where: { userId_periodId: { userId, periodId: period.id } },
    select: { status: true },
  });

  const questions: DailyChallengeQuestionView[] = assignments.map((assignment) => {
    const item = assignment.contentItem;
    const subQuestions = getSubQuestionsFromItem(item);
    const sub = subQuestions[assignment.subQuestionIndex];

    return {
      assignmentId: assignment.id,
      orderIndex: assignment.orderIndex,
      contentItemId: assignment.contentItemId,
      subQuestionIndex: assignment.subQuestionIndex,
      isAnswered: assignment.isAnswered,
      isCorrect: assignment.isCorrect,
      groupTitle: item.group.title,
      levelId: item.group.levelId,
      groupId: item.group.id,
      questionText: sub?.questionText ?? item.questionText ?? "",
      skill: sub?.skill ?? item.skill ?? QuestionSkill.READING,
      format: sub?.format ?? item.format ?? QuestionFormat.MULTIPLE_CHOICE,
      options: sub?.options ?? null,
      expectedSpeech: sub?.expectedSpeech ?? item.expectedSpeech,
      correctAnswer: sub?.correctAnswer ?? item.correctAnswer,
      audioUrl: sub?.audioUrl ?? item.audioUrl,
      essayRubric: sub?.essayRubric ?? item.essayRubric,
    };
  });

  const answeredCount = assignments.filter((a) => a.isAnswered).length;
  const totalCount = assignments.length || DAILY_CHALLENGE_QUESTION_COUNT;

  return {
    periodId: period.id,
    endsAt: period.endsAt,
    pointReward: period.template.pointReward,
    isComplete: progress?.status === "REWARDED",
    answeredCount,
    totalCount,
    questions,
  };
}
