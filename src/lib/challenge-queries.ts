import { ChallengeRecurrence, UserChallengeStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DAILY_CHALLENGE_QUESTION_COUNT,
  DAILY_CHALLENGE_SLUG,
  getObjectiveProgress,
  getPeriodBounds,
  getRecurrenceLabel,
  overallProgressPercent,
  parseChallengeObjectives,
  parseObjectiveCounts,
} from "@/lib/challenge";
import {
  ensureDailyChallengeQuestions,
  getDailyChallengeAnsweredCount,
} from "@/lib/daily-challenge-service";

export type ChallengeObjectiveView = {
  label: string;
  current: number;
  target: number;
  done: boolean;
};

export type ActiveChallengeView = {
  id: number;
  slug: string;
  title: string;
  description: string;
  recurrence: ChallengeRecurrence;
  recurrenceLabel: string;
  iconKey: string;
  pointReward: number;
  periodKey: string;
  startsAt: Date;
  endsAt: Date;
  status: UserChallengeStatus;
  progressPercent: number;
  objectives: ChallengeObjectiveView[];
  isComplete: boolean;
  playHref?: string;
};

export async function getActiveChallengesForUser(
  userId: number
): Promise<ActiveChallengeView[]> {
  const now = new Date();
  const templates = await prisma.challengeTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const views: ActiveChallengeView[] = [];

  for (const template of templates) {
    const objectives = parseChallengeObjectives(template.objectives);
    if (objectives.length === 0) continue;

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
    });

    const progress = await prisma.userChallengeProgress.findUnique({
      where: { userId_periodId: { userId, periodId: period.id } },
    });

    const status = progress?.status ?? UserChallengeStatus.IN_PROGRESS;

    if (template.slug === DAILY_CHALLENGE_SLUG) {
      await ensureDailyChallengeQuestions(userId, period.id, bounds.periodKey);
      const answeredCount = await getDailyChallengeAnsweredCount(
        userId,
        period.id
      );
      const target = DAILY_CHALLENGE_QUESTION_COUNT;

      views.push({
        id: template.id,
        slug: template.slug,
        title: template.title,
        description: template.description,
        recurrence: template.recurrence,
        recurrenceLabel: getRecurrenceLabel(template.recurrence),
        iconKey: template.iconKey,
        pointReward: template.pointReward,
        periodKey: bounds.periodKey,
        startsAt: bounds.startsAt,
        endsAt: bounds.endsAt,
        status,
        progressPercent:
          target > 0 ? Math.round((answeredCount / target) * 100) : 0,
        objectives: [
          {
            label: `Complete ${target} daily random questions`,
            current: Math.min(answeredCount, target),
            target,
            done: answeredCount >= target,
          },
        ],
        isComplete: status === UserChallengeStatus.REWARDED,
        playHref: "/dashboard/challenges/daily",
      });
      continue;
    }

    const counts = parseObjectiveCounts(progress?.objectiveCounts);
    const objectiveViews = getObjectiveProgress(objectives, counts).map((o) => ({
      label: o.label,
      current: o.current,
      target: o.target,
      done: o.done,
    }));

    views.push({
      id: template.id,
      slug: template.slug,
      title: template.title,
      description: template.description,
      recurrence: template.recurrence,
      recurrenceLabel: getRecurrenceLabel(template.recurrence),
      iconKey: template.iconKey,
      pointReward: template.pointReward,
      periodKey: bounds.periodKey,
      startsAt: bounds.startsAt,
      endsAt: bounds.endsAt,
      status,
      progressPercent: overallProgressPercent(objectives, counts),
      objectives: objectiveViews,
      isComplete: status === UserChallengeStatus.REWARDED,
    });
  }

  return views;
}

export async function getChallengePreviewSummary(userId: number) {
  const challenges = await getActiveChallengesForUser(userId);
  const completedCount = challenges.filter((c) => c.isComplete).length;
  const nextChallenge = challenges.find((c) => !c.isComplete) ?? null;

  return {
    totalCount: challenges.length,
    completedCount,
    nextChallenge,
  };
}
