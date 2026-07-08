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

type TemplateRow = {
  id: number;
  slug: string;
  title: string;
  description: string;
  recurrence: ChallengeRecurrence;
  iconKey: string;
  pointReward: number;
  objectives: unknown;
};

type PeriodRow = {
  id: number;
  templateId: number;
  periodKey: string;
  startsAt: Date;
  endsAt: Date;
};

async function loadPeriodsForTemplates(
  templates: TemplateRow[],
  now: Date,
  options?: { createMissing?: boolean }
): Promise<Map<number, PeriodRow>> {
  if (templates.length === 0) return new Map();

  const boundsByTemplate = new Map(
    templates.map((template) => [
      template.id,
      getPeriodBounds(template.recurrence, now),
    ])
  );

  const existing = await prisma.challengePeriod.findMany({
    where: {
      OR: templates.map((template) => {
        const bounds = boundsByTemplate.get(template.id)!;
        return { templateId: template.id, periodKey: bounds.periodKey };
      }),
    },
    select: {
      id: true,
      templateId: true,
      periodKey: true,
      startsAt: true,
      endsAt: true,
    },
  });

  const periodByTemplateId = new Map(
    existing.map((period) => [period.templateId, period])
  );

  if (options?.createMissing === false) {
    return periodByTemplateId;
  }

  const missing = templates.filter((template) => !periodByTemplateId.has(template.id));
  if (missing.length > 0) {
    await prisma.challengePeriod.createMany({
      data: missing.map((template) => {
        const bounds = boundsByTemplate.get(template.id)!;
        return {
          templateId: template.id,
          periodKey: bounds.periodKey,
          startsAt: bounds.startsAt,
          endsAt: bounds.endsAt,
        };
      }),
      skipDuplicates: true,
    });

    const created = await prisma.challengePeriod.findMany({
      where: {
        OR: missing.map((template) => {
          const bounds = boundsByTemplate.get(template.id)!;
          return { templateId: template.id, periodKey: bounds.periodKey };
        }),
      },
      select: {
        id: true,
        templateId: true,
        periodKey: true,
        startsAt: true,
        endsAt: true,
      },
    });

    for (const period of created) {
      periodByTemplateId.set(period.templateId, period);
    }
  }

  return periodByTemplateId;
}

function buildChallengeView(
  template: TemplateRow,
  period: PeriodRow,
  progress: {
    status: UserChallengeStatus;
    objectiveCounts: unknown;
  } | null,
  overrides?: Partial<Pick<ActiveChallengeView, "progressPercent" | "objectives" | "playHref">>
): ActiveChallengeView | null {
  const objectives = parseChallengeObjectives(template.objectives);
  if (objectives.length === 0) return null;

  const bounds = {
    periodKey: period.periodKey,
    startsAt: period.startsAt,
    endsAt: period.endsAt,
  };
  const status = progress?.status ?? UserChallengeStatus.IN_PROGRESS;
  const counts = parseObjectiveCounts(progress?.objectiveCounts);
  const objectiveViews =
    overrides?.objectives ??
    getObjectiveProgress(objectives, counts).map((objective) => ({
      label: objective.label,
      current: objective.current,
      target: objective.target,
      done: objective.done,
    }));

  return {
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
      overrides?.progressPercent ?? overallProgressPercent(objectives, counts),
    objectives: objectiveViews,
    isComplete: status === UserChallengeStatus.REWARDED,
    playHref: overrides?.playHref,
  };
}

export async function getActiveChallengesForUser(
  userId: number
): Promise<ActiveChallengeView[]> {
  const now = new Date();
  const templates = await prisma.challengeTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const periodByTemplateId = await loadPeriodsForTemplates(templates, now, {
    createMissing: true,
  });
  const periodIds = [...periodByTemplateId.values()].map((period) => period.id);

  const progressRows =
    periodIds.length === 0
      ? []
      : await prisma.userChallengeProgress.findMany({
          where: { userId, periodId: { in: periodIds } },
        });
  const progressByPeriodId = new Map(
    progressRows.map((row) => [row.periodId, row])
  );

  const views: ActiveChallengeView[] = [];

  for (const template of templates) {
    const period = periodByTemplateId.get(template.id);
    if (!period) continue;

    const progress = progressByPeriodId.get(period.id) ?? null;

    if (template.slug === DAILY_CHALLENGE_SLUG) {
      await ensureDailyChallengeQuestions(userId, period.id, period.periodKey);
      const answeredCount = await getDailyChallengeAnsweredCount(
        userId,
        period.id
      );
      const target = DAILY_CHALLENGE_QUESTION_COUNT;

      const view = buildChallengeView(template, period, progress, {
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
        playHref: "/dashboard/challenges/daily",
      });
      if (view) views.push(view);
      continue;
    }

    const view = buildChallengeView(template, period, progress);
    if (view) views.push(view);
  }

  return views;
}

/** Read-only summary for dashboard cards: no period upserts or daily question seeding. */
export async function getChallengePreviewSummary(userId: number) {
  const now = new Date();
  const templates = await prisma.challengeTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const periodByTemplateId = await loadPeriodsForTemplates(templates, now, {
    createMissing: false,
  });
  const periodIds = [...periodByTemplateId.values()].map((period) => period.id);

  const progressRows =
    periodIds.length === 0
      ? []
      : await prisma.userChallengeProgress.findMany({
          where: { userId, periodId: { in: periodIds } },
          select: { periodId: true, status: true, objectiveCounts: true },
        });
  const progressByPeriodId = new Map(
    progressRows.map((row) => [row.periodId, row])
  );

  const challenges: ActiveChallengeView[] = [];

  for (const template of templates) {
    const period = periodByTemplateId.get(template.id);
    if (!period) continue;

    const progress = progressByPeriodId.get(period.id) ?? null;
    const view = buildChallengeView(template, period, progress, {
      playHref:
        template.slug === DAILY_CHALLENGE_SLUG
          ? "/dashboard/challenges/daily"
          : undefined,
    });
    if (view) challenges.push(view);
  }

  const completedCount = challenges.filter((challenge) => challenge.isComplete).length;
  const nextChallenge = challenges.find((challenge) => !challenge.isComplete) ?? null;

  return {
    totalCount: challenges.length,
    completedCount,
    nextChallenge,
  };
}
