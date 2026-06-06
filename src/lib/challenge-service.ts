import {
  ChallengeRecurrence,
  PointEventType,
  UserChallengeStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/point-service";
import {
  buildChallengeRewardKey,
  ChallengeEvent,
  DAILY_CHALLENGE_SLUG,
  getPeriodBounds,
  isChallengeComplete,
  objectiveMatchesEvent,
  parseChallengeObjectives,
  parseObjectiveCounts,
} from "@/lib/challenge";

export type ChallengeCompletionResult = {
  challengeTitle: string;
  pointsAwarded: number;
  totalPoints: number;
};

async function getOrCreatePeriod(templateId: number, recurrence: ChallengeRecurrence) {
  const now = new Date();
  const bounds = getPeriodBounds(recurrence, now);

  return prisma.challengePeriod.upsert({
    where: {
      templateId_periodKey: {
        templateId,
        periodKey: bounds.periodKey,
      },
    },
    create: {
      templateId,
      periodKey: bounds.periodKey,
      startsAt: bounds.startsAt,
      endsAt: bounds.endsAt,
    },
    update: {},
    include: { template: true },
  });
}

async function rewardChallengeIfComplete(
  userId: number,
  progressId: number,
  periodId: number,
  templateTitle: string,
  pointReward: number
): Promise<ChallengeCompletionResult | null> {
  const now = new Date();

  const updated = await prisma.userChallengeProgress.updateMany({
    where: {
      id: progressId,
      userId,
      status: UserChallengeStatus.IN_PROGRESS,
    },
    data: {
      status: UserChallengeStatus.COMPLETED,
      completedAt: now,
    },
  });

  if (updated.count === 0) {
    return null;
  }

  const award = await awardPoints({
    userId,
    eventType: PointEventType.CHALLENGE_REWARD,
    eventKey: buildChallengeRewardKey(periodId),
    points: pointReward,
    metadata: { periodId, challengeTitle: templateTitle },
  });

  await prisma.userChallengeProgress.update({
    where: { id: progressId },
    data: {
      status: UserChallengeStatus.REWARDED,
      rewardedAt: now,
    },
  });

  return {
    challengeTitle: templateTitle,
    pointsAwarded: award.awarded,
    totalPoints: award.totalPoints,
  };
}

export async function recordChallengeEvent(
  userId: number,
  event: ChallengeEvent,
  at: Date = new Date()
): Promise<ChallengeCompletionResult[]> {
  const templates = await prisma.challengeTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const completions: ChallengeCompletionResult[] = [];

  for (const template of templates) {
    const objectives = parseChallengeObjectives(template.objectives);
    if (objectives.length === 0 && template.slug !== DAILY_CHALLENGE_SLUG) {
      continue;
    }

    if (template.slug === DAILY_CHALLENGE_SLUG) {
      // Daily challenge uses assigned random questions, not generic events.
      continue;
    }

    const hasMatchingObjective = objectives.some((objective) =>
      objectiveMatchesEvent(objective, event)
    );
    if (!hasMatchingObjective) continue;

    const bounds = getPeriodBounds(template.recurrence, at);
    if (at < bounds.startsAt || at > bounds.endsAt) continue;

    const period = await getOrCreatePeriod(template.id, template.recurrence);
    const counts = parseObjectiveCounts(
      (
        await prisma.userChallengeProgress.findUnique({
          where: { userId_periodId: { userId, periodId: period.id } },
          select: { objectiveCounts: true, status: true },
        })
      )?.objectiveCounts
    );

    const existing = await prisma.userChallengeProgress.findUnique({
      where: { userId_periodId: { userId, periodId: period.id } },
    });

    if (existing?.status === UserChallengeStatus.REWARDED) {
      continue;
    }

    const nextCounts = { ...counts };
    objectives.forEach((objective, index) => {
      if (!objectiveMatchesEvent(objective, event)) return;
      const key = String(index);
      const current = nextCounts[key] ?? 0;
      if (current >= objective.target) return;
      nextCounts[key] = current + 1;
    });

    const progress = await prisma.userChallengeProgress.upsert({
      where: { userId_periodId: { userId, periodId: period.id } },
      create: {
        userId,
        periodId: period.id,
        objectiveCounts: nextCounts,
        status: UserChallengeStatus.IN_PROGRESS,
      },
      update: {
        objectiveCounts: nextCounts,
      },
    });

    if (
      progress.status === UserChallengeStatus.IN_PROGRESS &&
      isChallengeComplete(objectives, nextCounts)
    ) {
      const completion = await rewardChallengeIfComplete(
        userId,
        progress.id,
        period.id,
        template.title,
        template.pointReward
      );
      if (completion && completion.pointsAwarded > 0) {
        completions.push(completion);
      }
    }
  }

  return completions;
}
