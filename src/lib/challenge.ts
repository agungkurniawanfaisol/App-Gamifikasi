import {
  ChallengeRecurrence,
  QuestionFormat,
  QuestionSkill,
} from "@prisma/client";

export const CHALLENGE_OBJECTIVE_TYPES = [
  "COMPLETE_MATERIALS",
  "CORRECT_ANSWERS",
  "SPEAKING_CORRECT",
  "CHAT_MESSAGES",
  "COMPLETE_GROUPS",
  "DAILY_RANDOM_QUESTIONS",
] as const;

export const DAILY_CHALLENGE_SLUG = "daily-challenge";
export const DAILY_CHALLENGE_QUESTION_COUNT = 5;

export type ChallengeObjectiveType =
  (typeof CHALLENGE_OBJECTIVE_TYPES)[number];

export type ChallengeObjective = {
  type: ChallengeObjectiveType;
  target: number;
  label?: string;
};

export type ChallengeEvent =
  | { kind: "MATERIAL_COMPLETE" }
  | {
      kind: "CORRECT_ANSWER";
      skill: QuestionSkill | null;
      format: QuestionFormat | null;
    }
  | { kind: "CHAT_MESSAGE" }
  | { kind: "GROUP_COMPLETE" };

export function parseChallengeObjectives(raw: unknown): ChallengeObjective[] {
  if (!Array.isArray(raw)) return [];

  const objectives: ChallengeObjective[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const type = obj.type;
    const target = obj.target;
    if (
      typeof type !== "string" ||
      !CHALLENGE_OBJECTIVE_TYPES.includes(type as ChallengeObjectiveType) ||
      typeof target !== "number" ||
      target < 1
    ) {
      continue;
    }

    objectives.push({
      type: type as ChallengeObjectiveType,
      target,
      label: typeof obj.label === "string" ? obj.label : undefined,
    });
  }

  return objectives;
}

export function objectiveMatchesEvent(
  objective: ChallengeObjective,
  event: ChallengeEvent
): boolean {
  switch (objective.type) {
    case "COMPLETE_MATERIALS":
      return event.kind === "MATERIAL_COMPLETE";
    case "CORRECT_ANSWERS":
      return event.kind === "CORRECT_ANSWER";
    case "SPEAKING_CORRECT":
      return (
        event.kind === "CORRECT_ANSWER" &&
        (event.skill === QuestionSkill.SPEAKING ||
          event.format === QuestionFormat.SPEECH_RECOGNITION)
      );
    case "CHAT_MESSAGES":
      return event.kind === "CHAT_MESSAGE";
    case "COMPLETE_GROUPS":
      return event.kind === "GROUP_COMPLETE";
    case "DAILY_RANDOM_QUESTIONS":
      return false;
    default:
      return false;
  }
}

export function parseObjectiveCounts(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "number" && value >= 0) {
      result[key] = value;
    }
  }
  return result;
}

export function getObjectiveProgress(
  objectives: ChallengeObjective[],
  counts: Record<string, number>
): { index: number; current: number; target: number; label: string; done: boolean }[] {
  return objectives.map((objective, index) => {
    const current = counts[String(index)] ?? 0;
    const label = objective.label ?? defaultObjectiveLabel(objective);
    return {
      index,
      current: Math.min(current, objective.target),
      target: objective.target,
      label,
      done: current >= objective.target,
    };
  });
}

export function isChallengeComplete(
  objectives: ChallengeObjective[],
  counts: Record<string, number>
): boolean {
  return objectives.every(
    (objective, index) => (counts[String(index)] ?? 0) >= objective.target
  );
}

export function overallProgressPercent(
  objectives: ChallengeObjective[],
  counts: Record<string, number>
): number {
  if (objectives.length === 0) return 0;
  const totalTarget = objectives.reduce((sum, o) => sum + o.target, 0);
  const totalCurrent = objectives.reduce(
    (sum, o, index) => sum + Math.min(counts[String(index)] ?? 0, o.target),
    0
  );
  return totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
}

function defaultObjectiveLabel(objective: ChallengeObjective): string {
  switch (objective.type) {
    case "COMPLETE_MATERIALS":
      return `Complete ${objective.target} material${objective.target === 1 ? "" : "s"}`;
    case "CORRECT_ANSWERS":
      return `Answer ${objective.target} question${objective.target === 1 ? "" : "s"} correctly`;
    case "SPEAKING_CORRECT":
      return `Pass ${objective.target} speaking question${objective.target === 1 ? "" : "s"}`;
    case "CHAT_MESSAGES":
      return `Send ${objective.target} chat message${objective.target === 1 ? "" : "s"}`;
    case "COMPLETE_GROUPS":
      return `Complete ${objective.target} learning group${objective.target === 1 ? "" : "s"}`;
    case "DAILY_RANDOM_QUESTIONS":
      return `Complete ${objective.target} daily random question${objective.target === 1 ? "" : "s"}`;
    default:
      return `Reach target of ${objective.target}`;
  }
}

export function buildChallengeRewardKey(periodId: number): string {
  return `challenge:${periodId}`;
}

export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export function endOfUtcDay(date: Date): Date {
  const start = startOfUtcDay(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getIsoWeekInfo(date: Date): { year: number; week: number } {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return { year, week };
}

export function utcWeekKey(date: Date): string {
  const { year, week } = getIsoWeekInfo(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function getPeriodBounds(
  recurrence: ChallengeRecurrence,
  date: Date
): { periodKey: string; startsAt: Date; endsAt: Date } {
  if (recurrence === ChallengeRecurrence.DAILY) {
    return {
      periodKey: utcDateKey(date),
      startsAt: startOfUtcDay(date),
      endsAt: endOfUtcDay(date),
    };
  }

  const day = date.getUTCDay() || 7;
  const monday = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - (day - 1)
    )
  );
  const sunday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

  return {
    periodKey: utcWeekKey(date),
    startsAt: monday,
    endsAt: sunday,
  };
}

export function getRecurrenceLabel(recurrence: ChallengeRecurrence): string {
  switch (recurrence) {
    case ChallengeRecurrence.DAILY:
      return "Daily";
    case ChallengeRecurrence.WEEKLY:
      return "Weekly";
    default:
      return recurrence;
  }
}
