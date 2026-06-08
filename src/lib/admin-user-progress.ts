import { AssessmentPhase, ContentItemType } from "@prisma/client";
import type { AssessmentAnswerRecord } from "@/lib/assessments";
import {
  getContentItemDescription,
} from "@/lib/content-item";
import type { GroupStatus } from "@/lib/labels";
import {
  resolveInitialPhase,
  type LearningPhase,
} from "@/lib/learning-phase";
import { prisma } from "@/lib/prisma";
import { getLevelGroupsWithProgress } from "@/lib/progression";
import type { LearningProgressSummary } from "@/lib/skill-progress";
import { getLearningProgressSummary } from "@/lib/skill-progress-queries";
import { getSubQuestionsFromItem } from "@/lib/sub-questions";
import type { ProficiencyLevelConfig, ProficiencyProgress } from "@/lib/proficiency";
import type { ProficiencySummary } from "@/lib/proficiency-queries";

export type AdminAssessmentAnswerDetail = {
  questionId: number;
  questionText: string;
  order: number;
  value: number | null;
  answeredAt: Date | null;
};

export type AdminContentAnswerDetail = {
  contentItemId: number;
  subQuestionIndex: number;
  itemLabel: string;
  itemType: ContentItemType;
  answer: string;
  isCorrect: boolean;
  scorePercent: number | null;
  aiFeedback: string | null;
  createdAt: Date;
};

export type AdminProgressHistoryEvent = {
  id: string;
  type:
    | "group_started"
    | "group_completed"
    | "content_answer"
    | "assessment_answer"
    | "testimonial";
  groupTitle: string;
  levelName: string;
  label: string;
  detail: string | null;
  assessmentPhase?: "pretest" | "posttest";
  feedbackId?: string;
  createdAt: Date;
};

export type AdminAssessmentPhaseProgress = {
  answered: number;
  total: number;
  answers: AdminAssessmentAnswerDetail[];
};

export type AdminGroupProgress = {
  group: {
    id: number;
    title: string;
    order: number;
    isPremium: boolean;
  };
  status: GroupStatus;
  phase: LearningPhase;
  stepProgress: { completed: number; total: number; percent: number };
  pretest: AdminAssessmentPhaseProgress;
  posttest: AdminAssessmentPhaseProgress;
  contentAnswers: { correct: number; incorrect: number; totalSlots: number };
  contentHistory: AdminContentAnswerDetail[];
  groupScorePercent: number | null;
  aiCompletionFeedback: string | null;
  testimonialRating: number | null;
  testimonialText: string | null;
  testimonialSubmittedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
};

export type AdminLevelProgress = {
  levelId: number;
  levelName: string;
  completed: number;
  total: number;
  groups: AdminGroupProgress[];
};

export type AdminUserProgressOverview = {
  summary: LearningProgressSummary;
  groupsCompleted: { completed: number; total: number };
  lastActivityAt: Date | null;
  history: AdminProgressHistoryEvent[];
  feedbackItems: AdminFeedbackItem[];
  levels: AdminLevelProgress[];
};

export type AdminFeedbackItem = {
  id: string;
  kind: "answer" | "completion";
  groupId: number;
  groupTitle: string;
  levelName: string;
  questionLabel: string;
  studentAnswer: string | null;
  isCorrect: boolean | null;
  scorePercent: number | null;
  aiFeedback: string | null;
  createdAt: Date;
};

export type UserProgressListSummary = {
  completedGroups: number;
  totalGroups: number;
  currentLevelName: string | null;
  currentGroupTitle: string | null;
  statusLabel: "notStarted" | "inProgress" | "completed";
};

type AssessmentQuestionRow = {
  id: number;
  groupId: number;
  phase: AssessmentPhase;
  order: number;
  questionText: string;
};

function buildAssessmentPhaseProgress(
  questions: AssessmentQuestionRow[],
  answersByQuestionId: Map<number, { value: number; createdAt: Date }>
): AdminAssessmentPhaseProgress {
  const answers: AdminAssessmentAnswerDetail[] = questions.map((question) => {
    const record = answersByQuestionId.get(question.id);
    return {
      questionId: question.id,
      questionText: question.questionText,
      order: question.order,
      value: record?.value ?? null,
      answeredAt: record?.createdAt ?? null,
    };
  });

  const answered = answers.filter((entry) => entry.value != null).length;

  return {
    answered,
    total: questions.length,
    answers,
  };
}

async function getBatchAssessmentData(
  userId: number,
  groupIds: number[]
): Promise<
  Map<
    number,
    {
      pretest: AdminAssessmentPhaseProgress;
      posttest: AdminAssessmentPhaseProgress;
      pretestAnswers: AssessmentAnswerRecord[];
      posttestAnswers: AssessmentAnswerRecord[];
    }
  >
> {
  const result = new Map<
    number,
    {
      pretest: AdminAssessmentPhaseProgress;
      posttest: AdminAssessmentPhaseProgress;
      pretestAnswers: AssessmentAnswerRecord[];
      posttestAnswers: AssessmentAnswerRecord[];
    }
  >();

  if (groupIds.length === 0) return result;

  const [questions, userAnswers] = await Promise.all([
    prisma.groupAssessmentQuestion.findMany({
      where: { groupId: { in: groupIds } },
      orderBy: [{ phase: "asc" }, { order: "asc" }],
      select: {
        id: true,
        groupId: true,
        phase: true,
        order: true,
        questionText: true,
      },
    }),
    prisma.userAssessmentAnswer.findMany({
      where: {
        userId,
        question: { groupId: { in: groupIds } },
      },
      select: { questionId: true, value: true, createdAt: true },
    }),
  ]);

  const answersByQuestionId = new Map(
    userAnswers.map((answer) => [
      answer.questionId,
      { value: answer.value, createdAt: answer.createdAt },
    ])
  );

  const questionsByGroup = new Map<number, AssessmentQuestionRow[]>();
  for (const question of questions) {
    const list = questionsByGroup.get(question.groupId) ?? [];
    list.push(question);
    questionsByGroup.set(question.groupId, list);
  }

  for (const groupId of groupIds) {
    const groupQuestions = questionsByGroup.get(groupId) ?? [];
    const pretestQuestions = groupQuestions.filter(
      (question) => question.phase === AssessmentPhase.PRETEST
    );
    const posttestQuestions = groupQuestions.filter(
      (question) => question.phase === AssessmentPhase.POSTTEST
    );

    const pretest = buildAssessmentPhaseProgress(
      pretestQuestions,
      answersByQuestionId
    );
    const posttest = buildAssessmentPhaseProgress(
      posttestQuestions,
      answersByQuestionId
    );

    result.set(groupId, {
      pretest,
      posttest,
      pretestAnswers: pretest.answers
        .filter(
          (entry): entry is AdminAssessmentAnswerDetail & { value: number } =>
            entry.value != null
        )
        .map((entry) => ({ questionId: entry.questionId, value: entry.value })),
      posttestAnswers: posttest.answers
        .filter(
          (entry): entry is AdminAssessmentAnswerDetail & { value: number } =>
            entry.value != null
        )
        .map((entry) => ({ questionId: entry.questionId, value: entry.value })),
    });
  }

  return result;
}

async function getBatchContentAnswerDetails(
  userId: number,
  groupIds: number[]
): Promise<
  Map<
    number,
    {
      stats: { correct: number; incorrect: number; totalSlots: number };
      history: AdminContentAnswerDetail[];
    }
  >
> {
  const result = new Map<
    number,
    {
      stats: { correct: number; incorrect: number; totalSlots: number };
      history: AdminContentAnswerDetail[];
    }
  >();

  if (groupIds.length === 0) return result;

  for (const groupId of groupIds) {
    result.set(groupId, {
      stats: { correct: 0, incorrect: 0, totalSlots: 0 },
      history: [],
    });
  }

  const answers = await prisma.userAnswer.findMany({
    where: {
      userId,
      contentItem: { groupId: { in: groupIds } },
    },
    orderBy: { createdAt: "asc" },
    select: {
      contentItemId: true,
      subQuestionIndex: true,
      answer: true,
      isCorrect: true,
      scorePercent: true,
      aiFeedback: true,
      createdAt: true,
      contentItem: {
        select: {
          groupId: true,
          type: true,
          title: true,
          questionText: true,
          skill: true,
          format: true,
          subQuestions: true,
        },
      },
    },
  });

  for (const row of answers) {
    const groupId = row.contentItem.groupId;
    const bucket = result.get(groupId);
    if (!bucket) continue;

    bucket.stats.totalSlots += 1;
    if (row.isCorrect) bucket.stats.correct += 1;
    else bucket.stats.incorrect += 1;

    const subQuestions = getSubQuestionsFromItem(row.contentItem);
    const subQuestion = subQuestions[row.subQuestionIndex];
    const itemLabel =
      subQuestion?.questionText?.trim() ||
      getContentItemDescription({
        id: row.contentItemId,
        type: row.contentItem.type,
        title: row.contentItem.title,
        questionText: row.contentItem.questionText,
        skill: row.contentItem.skill,
        format: row.contentItem.format,
        subQuestions,
      });

    bucket.history.push({
      contentItemId: row.contentItemId,
      subQuestionIndex: row.subQuestionIndex,
      itemLabel,
      itemType: row.contentItem.type,
      answer: row.answer,
      isCorrect: row.isCorrect,
      scorePercent: row.scorePercent,
      aiFeedback: row.aiFeedback,
      createdAt: row.createdAt,
    });
  }

  return result;
}

export function buildProgressHistory(
  levels: AdminLevelProgress[]
): AdminProgressHistoryEvent[] {
  const events: AdminProgressHistoryEvent[] = [];

  for (const level of levels) {
    for (const group of level.groups) {
      const groupTitle = group.group.title;

      if (group.startedAt) {
        events.push({
          id: `start-${group.group.id}-${group.startedAt.getTime()}`,
          type: "group_started",
          groupTitle,
          levelName: level.levelName,
          label: groupTitle,
          detail: null,
          createdAt: group.startedAt,
        });
      }

      for (const answer of group.contentHistory) {
        const feedbackId = `answer-${answer.contentItemId}-${answer.subQuestionIndex}-${answer.createdAt.getTime()}`;
        events.push({
          id: `content-${answer.contentItemId}-${answer.subQuestionIndex}-${answer.createdAt.getTime()}`,
          type: "content_answer",
          groupTitle,
          levelName: level.levelName,
          label: answer.itemLabel,
          detail: answer.answer,
          feedbackId,
          createdAt: answer.createdAt,
        });
      }

      for (const answer of group.pretest.answers) {
        if (answer.value == null || !answer.answeredAt) continue;
        events.push({
          id: `pretest-${answer.questionId}-${answer.answeredAt.getTime()}`,
          type: "assessment_answer",
          groupTitle,
          levelName: level.levelName,
          label: answer.questionText,
          detail: `${answer.value}/5`,
          assessmentPhase: "pretest",
          createdAt: answer.answeredAt,
        });
      }

      for (const answer of group.posttest.answers) {
        if (answer.value == null || !answer.answeredAt) continue;
        events.push({
          id: `posttest-${answer.questionId}-${answer.answeredAt.getTime()}`,
          type: "assessment_answer",
          groupTitle,
          levelName: level.levelName,
          label: answer.questionText,
          detail: `${answer.value}/5`,
          assessmentPhase: "posttest",
          createdAt: answer.answeredAt,
        });
      }

      if (group.completedAt) {
        events.push({
          id: `complete-${group.group.id}-${group.completedAt.getTime()}`,
          type: "group_completed",
          groupTitle,
          levelName: level.levelName,
          label: groupTitle,
          detail:
            group.groupScorePercent != null
              ? `${group.groupScorePercent}%`
              : null,
          feedbackId: group.aiCompletionFeedback
            ? `completion-${group.group.id}`
            : undefined,
          createdAt: group.completedAt,
        });
      }

      if (group.testimonialSubmittedAt) {
        events.push({
          id: `testimonial-${group.group.id}-${group.testimonialSubmittedAt.getTime()}`,
          type: "testimonial",
          groupTitle,
          levelName: level.levelName,
          label: groupTitle,
          detail: group.testimonialText,
          createdAt: group.testimonialSubmittedAt,
        });
      }
    }
  }

  return events.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export function buildAdminFeedbackItems(
  levels: AdminLevelProgress[]
): AdminFeedbackItem[] {
  const items: AdminFeedbackItem[] = [];

  for (const level of levels) {
    for (const group of level.groups) {
      for (const entry of group.contentHistory) {
        items.push({
          id: `answer-${entry.contentItemId}-${entry.subQuestionIndex}-${entry.createdAt.getTime()}`,
          kind: "answer",
          groupId: group.group.id,
          groupTitle: group.group.title,
          levelName: level.levelName,
          questionLabel: entry.itemLabel,
          studentAnswer: entry.answer,
          isCorrect: entry.isCorrect,
          scorePercent: entry.scorePercent,
          aiFeedback: entry.aiFeedback,
          createdAt: entry.createdAt,
        });
      }

      if (group.aiCompletionFeedback) {
        items.push({
          id: `completion-${group.group.id}`,
          kind: "completion",
          groupId: group.group.id,
          groupTitle: group.group.title,
          levelName: level.levelName,
          questionLabel: group.group.title,
          studentAnswer: group.testimonialText,
          isCorrect: null,
          scorePercent: group.groupScorePercent,
          aiFeedback: group.aiCompletionFeedback,
          createdAt:
            group.completedAt ??
            group.testimonialSubmittedAt ??
            group.startedAt ??
            new Date(0),
        });
      }
    }
  }

  return items.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

async function getUserLastActivityAt(userId: number): Promise<Date | null> {
  const [progressRows, contentAnswer, assessmentAnswer] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId },
      select: { startedAt: true, completedAt: true },
    }),
    prisma.userAnswer.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.userAssessmentAnswer.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  const timestamps: Date[] = [];
  for (const row of progressRows) {
    timestamps.push(row.startedAt);
    if (row.completedAt) timestamps.push(row.completedAt);
  }
  if (contentAnswer) timestamps.push(contentAnswer.createdAt);
  if (assessmentAnswer) timestamps.push(assessmentAnswer.createdAt);

  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps.map((date) => date.getTime())));
}

export async function getAdminUserProgressOverview(
  userId: number
): Promise<AdminUserProgressOverviewClient> {
  const [summary, levels, lastActivityAt] = await Promise.all([
    getLearningProgressSummary(userId),
    prisma.level.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
    getUserLastActivityAt(userId),
  ]);

  const levelProgressList: AdminLevelProgress[] = [];
  let totalCompleted = 0;
  let totalGroups = 0;

  for (const level of levels) {
    const groupsWithProgress = await getLevelGroupsWithProgress(userId, level.id);
    const groupIds = groupsWithProgress.map((entry) => entry.group.id);

    const [assessmentMap, contentDetailsMap, progressRecords] = await Promise.all([
      getBatchAssessmentData(userId, groupIds),
      getBatchContentAnswerDetails(userId, groupIds),
      prisma.userProgress.findMany({
        where: { userId, groupId: { in: groupIds } },
        select: {
          groupId: true,
          isGroupCompleted: true,
          groupScorePercent: true,
          aiCompletionFeedback: true,
          testimonialRating: true,
          testimonialText: true,
          testimonialSubmittedAt: true,
          startedAt: true,
          completedAt: true,
        },
      }),
    ]);

    const progressByGroup = new Map(
      progressRecords.map((record) => [record.groupId, record])
    );

    const groups: AdminGroupProgress[] = groupsWithProgress.map(
      ({ group, status, stepProgress, learningComplete }) => {
        const assessment = assessmentMap.get(group.id);
        const progress = progressByGroup.get(group.id);
        const groupCompleted = progress?.isGroupCompleted ?? false;

        const pretestPayload =
          assessment?.pretest.answers.map((entry) => ({
            id: entry.questionId,
            groupId: group.id,
            phase: AssessmentPhase.PRETEST as AssessmentPhase,
            order: entry.order,
            questionText: entry.questionText,
          })) ?? [];

        const posttestPayload =
          assessment?.posttest.answers.map((entry) => ({
            id: entry.questionId,
            groupId: group.id,
            phase: AssessmentPhase.POSTTEST as AssessmentPhase,
            order: entry.order,
            questionText: entry.questionText,
          })) ?? [];

        const phase = resolveInitialPhase(
          pretestPayload,
          posttestPayload,
          assessment?.pretestAnswers ?? [],
          assessment?.posttestAnswers ?? [],
          learningComplete,
          groupCompleted
        );

        const contentDetails = contentDetailsMap.get(group.id) ?? {
          stats: { correct: 0, incorrect: 0, totalSlots: 0 },
          history: [],
        };

        return {
          group: {
            id: group.id,
            title: group.title,
            order: group.order,
            isPremium: group.isPremium,
          },
          status,
          phase,
          stepProgress,
          pretest: assessment?.pretest ?? { answered: 0, total: 0, answers: [] },
          posttest: assessment?.posttest ?? { answered: 0, total: 0, answers: [] },
          contentAnswers: contentDetails.stats,
          contentHistory: contentDetails.history,
          groupScorePercent: progress?.groupScorePercent ?? null,
          aiCompletionFeedback: progress?.aiCompletionFeedback ?? null,
          testimonialRating: progress?.testimonialRating ?? null,
          testimonialText: progress?.testimonialText ?? null,
          testimonialSubmittedAt: progress?.testimonialSubmittedAt ?? null,
          startedAt: progress?.startedAt ?? null,
          completedAt: progress?.completedAt ?? null,
        };
      }
    );

    const completed = groups.filter((group) => group.status === "completed").length;
    totalCompleted += completed;
    totalGroups += groups.length;

    levelProgressList.push({
      levelId: level.id,
      levelName: level.name,
      completed,
      total: groups.length,
      groups,
    });
  }

  return serializeAdminUserProgressOverview({
    summary,
    groupsCompleted: { completed: totalCompleted, total: totalGroups },
    lastActivityAt,
    history: buildProgressHistory(levelProgressList),
    feedbackItems: buildAdminFeedbackItems(levelProgressList),
    levels: levelProgressList,
  });
}

export async function getUsersProgressSummaries(
  userIds: number[]
): Promise<Map<number, UserProgressListSummary>> {
  const result = new Map<number, UserProgressListSummary>();
  if (userIds.length === 0) return result;

  const publishedGroups = await prisma.learningGroup.findMany({
    where: { isPublished: true },
    orderBy: [{ level: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      level: { select: { name: true, order: true } },
    },
  });

  const totalGroups = publishedGroups.length;

  const completedRows = await prisma.userProgress.findMany({
    where: {
      userId: { in: userIds },
      isGroupCompleted: true,
      group: { isPublished: true },
    },
    select: { userId: true, groupId: true },
  });

  const inProgressRows = await prisma.userProgress.findMany({
    where: {
      userId: { in: userIds },
      isGroupCompleted: false,
      group: { isPublished: true },
      OR: [
        { lastContentItemId: { not: null } },
        { testimonialSubmittedAt: { not: null } },
      ],
    },
    select: {
      userId: true,
      groupId: true,
      startedAt: true,
    },
    orderBy: { startedAt: "desc" },
  });

  const completedByUser = new Map<number, Set<number>>();
  for (const row of completedRows) {
    const set = completedByUser.get(row.userId) ?? new Set<number>();
    set.add(row.groupId);
    completedByUser.set(row.userId, set);
  }

  const groupById = new Map(publishedGroups.map((group) => [group.id, group]));

  for (const userId of userIds) {
    const completedCount = completedByUser.get(userId)?.size ?? 0;

    let statusLabel: UserProgressListSummary["statusLabel"] = "notStarted";
    if (totalGroups > 0 && completedCount >= totalGroups) {
      statusLabel = "completed";
    } else if (
      completedCount > 0 ||
      inProgressRows.some((row) => row.userId === userId)
    ) {
      statusLabel = "inProgress";
    }

    const userInProgress = inProgressRows.find((row) => row.userId === userId);
    let currentLevelName: string | null = null;
    let currentGroupTitle: string | null = null;

    if (userInProgress) {
      const group = groupById.get(userInProgress.groupId);
      currentLevelName = group?.level.name ?? null;
      currentGroupTitle = group?.title ?? null;
    } else if (statusLabel === "inProgress" || statusLabel === "completed") {
      const nextGroup = publishedGroups.find(
        (group) => !completedByUser.get(userId)?.has(group.id)
      );
      if (nextGroup) {
        currentLevelName = nextGroup.level.name;
        currentGroupTitle = nextGroup.title;
      }
    }

    result.set(userId, {
      completedGroups: completedCount,
      totalGroups,
      currentLevelName,
      currentGroupTitle,
      statusLabel,
    });
  }

  return result;
}

/** Proficiency level without Lucide icon (safe for client props). */
export type ProficiencyLevelClient = Omit<ProficiencyLevelConfig, "icon">;

export type ProficiencyProgressClient = {
  currentLevel: ProficiencyLevelClient;
  nextLevel: ProficiencyLevelClient | null;
  progress: number;
  scoreToNext: number;
};

export type ProficiencySummaryClient = {
  score: number;
  level: ProficiencyLevelClient;
  progress: ProficiencyProgressClient;
};

export type LearningProgressSummaryClient = Omit<
  LearningProgressSummary,
  "proficiency"
> & {
  proficiency: ProficiencySummaryClient;
};

export type AdminAssessmentAnswerDetailClient = Omit<
  AdminAssessmentAnswerDetail,
  "answeredAt"
> & {
  answeredAt: string | null;
};

export type AdminAssessmentPhaseProgressClient = Omit<
  AdminAssessmentPhaseProgress,
  "answers"
> & {
  answers: AdminAssessmentAnswerDetailClient[];
};

export type AdminContentAnswerDetailClient = Omit<
  AdminContentAnswerDetail,
  "createdAt"
> & {
  createdAt: string;
};

export type AdminGroupProgressClient = Omit<
  AdminGroupProgress,
  | "pretest"
  | "posttest"
  | "contentHistory"
  | "startedAt"
  | "completedAt"
  | "testimonialSubmittedAt"
> & {
  pretest: AdminAssessmentPhaseProgressClient;
  posttest: AdminAssessmentPhaseProgressClient;
  contentHistory: AdminContentAnswerDetailClient[];
  startedAt: string | null;
  completedAt: string | null;
  testimonialSubmittedAt: string | null;
};

export type AdminLevelProgressClient = Omit<AdminLevelProgress, "groups"> & {
  groups: AdminGroupProgressClient[];
};

export type AdminProgressHistoryEventClient = Omit<
  AdminProgressHistoryEvent,
  "createdAt"
> & {
  createdAt: string;
};

export type AdminFeedbackItemClient = Omit<AdminFeedbackItem, "createdAt"> & {
  createdAt: string;
};

export type AdminUserProgressOverviewClient = Omit<
  AdminUserProgressOverview,
  | "summary"
  | "lastActivityAt"
  | "levels"
  | "history"
  | "feedbackItems"
> & {
  summary: LearningProgressSummaryClient;
  lastActivityAt: string | null;
  levels: AdminLevelProgressClient[];
  history: AdminProgressHistoryEventClient[];
  feedbackItems: AdminFeedbackItemClient[];
};

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function stripIcon(level: ProficiencyLevelConfig): ProficiencyLevelClient {
  const { icon: _icon, ...rest } = level;
  return rest;
}

function serializeProficiencyProgress(
  progress: ProficiencyProgress
): ProficiencyProgressClient {
  return {
    currentLevel: stripIcon(progress.currentLevel),
    nextLevel: progress.nextLevel ? stripIcon(progress.nextLevel) : null,
    progress: progress.progress,
    scoreToNext: progress.scoreToNext,
  };
}

function serializeProficiencySummary(
  summary: ProficiencySummary
): ProficiencySummaryClient {
  return {
    score: summary.score,
    level: stripIcon(summary.level),
    progress: serializeProficiencyProgress(summary.progress),
  };
}

function serializeLearningSummary(
  summary: LearningProgressSummary
): LearningProgressSummaryClient {
  return {
    ...summary,
    proficiency: serializeProficiencySummary(summary.proficiency),
  };
}

export function serializeAdminUserProgressOverview(
  overview: AdminUserProgressOverview
): AdminUserProgressOverviewClient {
  return {
    ...overview,
    summary: serializeLearningSummary(overview.summary),
    lastActivityAt: toIso(overview.lastActivityAt),
    levels: overview.levels.map((level) => ({
      ...level,
      groups: level.groups.map((group) => ({
        ...group,
        pretest: {
          ...group.pretest,
          answers: group.pretest.answers.map((answer) => ({
            ...answer,
            answeredAt: toIso(answer.answeredAt),
          })),
        },
        posttest: {
          ...group.posttest,
          answers: group.posttest.answers.map((answer) => ({
            ...answer,
            answeredAt: toIso(answer.answeredAt),
          })),
        },
        contentHistory: group.contentHistory.map((entry) => ({
          ...entry,
          createdAt: entry.createdAt.toISOString(),
        })),
        startedAt: toIso(group.startedAt),
        completedAt: toIso(group.completedAt),
        testimonialSubmittedAt: toIso(group.testimonialSubmittedAt),
      })),
    })),
    history: overview.history.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    })),
    feedbackItems: overview.feedbackItems.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}
