import { AssessmentPhase, ContentItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSubQuestionsFromItem } from "@/lib/content-item";
import { isItemFullyAnswered } from "@/lib/sub-questions";
import { hasPremiumUnlockForLevel } from "@/lib/premium-access";
import type { GroupStatus } from "@/lib/labels";

export async function getPublishedGroupsForLevel(levelId: number) {
  return prisma.learningGroup.findMany({
    where: { levelId, isPublished: true },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { contentItems: true } },
    },
  });
}

type StepProgressSnapshot = {
  isGroupCompleted: boolean;
  lastContentItemId: number | null;
};

type ProgressSnapshot = StepProgressSnapshot & {
  groupScorePercent: number | null;
  testimonialSubmittedAt: Date | null;
};

export function buildGroupAccessMap(
  groups: { id: number }[],
  progressByGroupId: Map<number, Pick<ProgressSnapshot, "isGroupCompleted">>
): Map<number, boolean> {
  const access = new Map<number, boolean>();
  for (let i = 0; i < groups.length; i++) {
    if (i === 0) {
      access.set(groups[i].id, true);
      continue;
    }
    const previousGroup = groups[i - 1];
    access.set(
      groups[i].id,
      progressByGroupId.get(previousGroup.id)?.isGroupCompleted === true
    );
  }
  return access;
}

export async function canAccessGroup(
  userId: number,
  groupId: number,
  levelId: number
): Promise<boolean> {
  const groups = await getPublishedGroupsForLevel(levelId);
  const index = groups.findIndex((g) => g.id === groupId);
  if (index === -1) return false;

  const group = groups[index];
  let sequentialAccess = index === 0;
  if (!sequentialAccess) {
    const previousGroup = groups[index - 1];
    const prevProgress = await prisma.userProgress.findUnique({
      where: {
        userId_groupId: { userId, groupId: previousGroup.id },
      },
      select: { isGroupCompleted: true },
    });
    sequentialAccess = prevProgress?.isGroupCompleted === true;
  }

  if (!sequentialAccess) return false;
  if (!group.isPremium) return true;
  return hasPremiumUnlockForLevel(userId, group.levelId);
}

function computeStepProgress(
  items: { id: number }[],
  progress: StepProgressSnapshot | null
): { completed: number; total: number; percent: number } {
  const total = items.length;
  if (total === 0) return { completed: 0, total: 0, percent: 0 };

  let completed = 0;
  if (progress?.lastContentItemId) {
    const lastIndex = items.findIndex(
      (m) => m.id === progress.lastContentItemId
    );
    completed = lastIndex >= 0 ? lastIndex + 1 : 0;
  }
  if (progress?.isGroupCompleted) completed = total;

  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

async function getBatchGroupLearningComplete(
  userId: number,
  groupIds: number[]
): Promise<Map<number, boolean>> {
  const result = new Map<number, boolean>();
  if (groupIds.length === 0) return result;

  const [
    contentItems,
    userAnswers,
    assessmentQuestions,
    assessmentAnswers,
    progressList,
  ] = await Promise.all([
    prisma.groupContentItem.findMany({
      where: { groupId: { in: groupIds } },
      orderBy: { order: "asc" },
      select: {
        id: true,
        groupId: true,
        type: true,
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
    }),
    prisma.userAnswer.findMany({
      where: {
        userId,
        contentItem: { groupId: { in: groupIds } },
      },
      select: { contentItemId: true, subQuestionIndex: true },
    }),
    prisma.groupAssessmentQuestion.findMany({
      where: { groupId: { in: groupIds } },
      select: { id: true, groupId: true, phase: true },
    }),
    prisma.userAssessmentAnswer.findMany({
      where: {
        userId,
        question: { groupId: { in: groupIds } },
      },
      select: { questionId: true },
    }),
    prisma.userProgress.findMany({
      where: { userId, groupId: { in: groupIds } },
      select: { groupId: true, lastContentItemId: true },
    }),
  ]);

  const itemsByGroup = new Map<number, typeof contentItems>();
  for (const item of contentItems) {
    const list = itemsByGroup.get(item.groupId) ?? [];
    list.push(item);
    itemsByGroup.set(item.groupId, list);
  }

  const answersByItem = new Map<number, { subQuestionIndex: number }[]>();
  for (const answer of userAnswers) {
    const list = answersByItem.get(answer.contentItemId) ?? [];
    list.push({ subQuestionIndex: answer.subQuestionIndex });
    answersByItem.set(answer.contentItemId, list);
  }

  const assessmentsByGroup = new Map<
    number,
    { pretest: number[]; posttest: number[] }
  >();
  for (const question of assessmentQuestions) {
    const entry = assessmentsByGroup.get(question.groupId) ?? {
      pretest: [],
      posttest: [],
    };
    if (question.phase === AssessmentPhase.PRETEST) {
      entry.pretest.push(question.id);
    } else {
      entry.posttest.push(question.id);
    }
    assessmentsByGroup.set(question.groupId, entry);
  }

  const answeredAssessmentIds = new Set(
    assessmentAnswers.map((answer) => answer.questionId)
  );
  const progressByGroup = new Map(
    progressList.map((progress) => [progress.groupId, progress])
  );

  for (const groupId of groupIds) {
    const items = itemsByGroup.get(groupId) ?? [];
    if (items.length === 0) {
      result.set(groupId, false);
      continue;
    }

    const progress = progressByGroup.get(groupId);
    const lastItemId = items[items.length - 1]?.id;
    const reachedEnd =
      lastItemId != null && progress?.lastContentItemId === lastItemId;

    const questionItems = items.filter(
      (item) => item.type === ContentItemType.QUESTION
    );
    const allQuestionsAnswered =
      questionItems.length === 0 ||
      questionItems.every((item) => {
        const subQuestions = getSubQuestionsFromItem(item);
        const itemAnswers = answersByItem.get(item.id) ?? [];
        return isItemFullyAnswered(subQuestions.length, itemAnswers);
      });

    const assessments = assessmentsByGroup.get(groupId) ?? {
      pretest: [],
      posttest: [],
    };
    const pretestComplete =
      assessments.pretest.length === 0 ||
      assessments.pretest.every((id) => answeredAssessmentIds.has(id));
    const posttestComplete =
      assessments.posttest.length === 0 ||
      assessments.posttest.every((id) => answeredAssessmentIds.has(id));

    result.set(
      groupId,
      reachedEnd &&
        allQuestionsAnswered &&
        pretestComplete &&
        posttestComplete
    );
  }

  return result;
}

export async function getGroupStepProgress(
  userId: number,
  groupId: number
): Promise<{ completed: number; total: number; percent: number }> {
  const [items, progress] = await Promise.all([
    prisma.groupContentItem.findMany({
      where: { groupId },
      orderBy: { order: "asc" },
      select: { id: true },
    }),
    prisma.userProgress.findUnique({
      where: { userId_groupId: { userId, groupId } },
      select: {
        lastContentItemId: true,
        isGroupCompleted: true,
      },
    }),
  ]);

  return computeStepProgress(items, progress);
}

export async function getBatchGroupStepProgress(
  userId: number,
  groupIds: number[]
): Promise<Map<number, { completed: number; total: number; percent: number }>> {
  if (groupIds.length === 0) return new Map();

  const [items, progressList] = await Promise.all([
    prisma.groupContentItem.findMany({
      where: { groupId: { in: groupIds } },
      orderBy: { order: "asc" },
      select: { id: true, groupId: true },
    }),
    prisma.userProgress.findMany({
      where: { userId, groupId: { in: groupIds } },
      select: {
        groupId: true,
        lastContentItemId: true,
        isGroupCompleted: true,
      },
    }),
  ]);

  const itemsByGroup = new Map<number, { id: number }[]>();
  for (const item of items) {
    const list = itemsByGroup.get(item.groupId) ?? [];
    list.push({ id: item.id });
    itemsByGroup.set(item.groupId, list);
  }

  const progressByGroup = new Map(progressList.map((p) => [p.groupId, p]));

  const result = new Map<
    number,
    { completed: number; total: number; percent: number }
  >();
  for (const groupId of groupIds) {
    result.set(
      groupId,
      computeStepProgress(
        itemsByGroup.get(groupId) ?? [],
        progressByGroup.get(groupId) ?? null
      )
    );
  }
  return result;
}

export async function getLevelGroupsWithProgress(
  userId: number,
  levelId: number
) {
  const groups = await getPublishedGroupsForLevel(levelId);
  const groupIds = groups.map((g) => g.id);

  const [progressList, stepProgressMap, learningCompleteMap, hasPremiumUnlock] =
    await Promise.all([
    prisma.userProgress.findMany({
      where: { userId, groupId: { in: groupIds } },
      select: {
        groupId: true,
        isGroupCompleted: true,
        lastContentItemId: true,
        groupScorePercent: true,
        testimonialSubmittedAt: true,
      },
    }),
    getBatchGroupStepProgress(userId, groupIds),
    getBatchGroupLearningComplete(userId, groupIds),
    hasPremiumUnlockForLevel(userId, levelId),
  ]);

  const progressByGroup = new Map(progressList.map((p) => [p.groupId, p]));
  const accessMap = buildGroupAccessMap(groups, progressByGroup);

  return groups.map((group) => {
    const sequentialAccess = accessMap.get(group.id) ?? false;
    const premiumLocked = group.isPremium && !hasPremiumUnlock;
    const canAccess = sequentialAccess && !premiumLocked;

    return {
      group,
      canAccess,
      premiumLocked,
      sequentialAccess,
      stepProgress: stepProgressMap.get(group.id) ?? {
        completed: 0,
        total: 0,
        percent: 0,
      },
      learningComplete: learningCompleteMap.get(group.id) ?? false,
      status: deriveGroupStatus(
        progressByGroup.get(group.id) ?? null,
        learningCompleteMap.get(group.id) ?? false
      ),
    };
  });
}

export async function getLevelProgressSummary(userId: number, levelId: number) {
  const batch = await getBatchLevelProgressSummaries(userId, [levelId]);
  return batch.get(levelId) ?? { completed: 0, total: 0 };
}

export async function getBatchLevelProgressSummaries(
  userId: number,
  levelIds: number[]
): Promise<Map<number, { completed: number; total: number }>> {
  const result = new Map<number, { completed: number; total: number }>();
  if (levelIds.length === 0) return result;

  for (const levelId of levelIds) {
    result.set(levelId, { completed: 0, total: 0 });
  }

  const groups = await prisma.learningGroup.findMany({
    where: { levelId: { in: levelIds }, isPublished: true },
    select: { id: true, levelId: true },
  });

  const groupsByLevel = new Map<number, number[]>();
  for (const group of groups) {
    const list = groupsByLevel.get(group.levelId) ?? [];
    list.push(group.id);
    groupsByLevel.set(group.levelId, list);
  }

  for (const levelId of levelIds) {
    result.set(levelId, {
      completed: 0,
      total: groupsByLevel.get(levelId)?.length ?? 0,
    });
  }

  const groupIds = groups.map((g) => g.id);
  if (groupIds.length === 0) return result;

  const progressList = await prisma.userProgress.findMany({
    where: {
      userId,
      groupId: { in: groupIds },
      isGroupCompleted: true,
    },
    select: { groupId: true },
  });

  const completedGroupIds = new Set(progressList.map((p) => p.groupId));
  const completedByLevel = new Map<number, number>();

  for (const group of groups) {
    if (completedGroupIds.has(group.id)) {
      completedByLevel.set(
        group.levelId,
        (completedByLevel.get(group.levelId) ?? 0) + 1
      );
    }
  }

  for (const [levelId, completed] of completedByLevel) {
    const current = result.get(levelId);
    if (current) {
      result.set(levelId, { ...current, completed });
    }
  }

  return result;
}

function deriveGroupStatus(
  progress: ProgressSnapshot | null,
  learningComplete: boolean
): GroupStatus {
  if (
    progress?.isGroupCompleted ||
    progress?.testimonialSubmittedAt
  ) {
    return "completed";
  }
  if (progress?.lastContentItemId || learningComplete) return "inProgress";
  if (!progress) return "notStarted";
  return "notStarted";
}
