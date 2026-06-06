import {
  BookOpen,
  GraduationCap,
  Languages,
  Rocket,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { labels } from "@/lib/labels";

export type ProficiencyLevelName =
  | "beginner"
  | "elementary"
  | "intermediate"
  | "upper_intermediate"
  | "advanced";

export type ProficiencyLevelConfig = {
  name: ProficiencyLevelName;
  label: string;
  description: string;
  minScore: number;
  maxScore: number | null;
  color: string;
  badgeBg: string;
  badgeText: string;
  icon: LucideIcon;
  progressColor: string;
};

export const PROFICIENCY_LEVELS: Record<
  ProficiencyLevelName,
  ProficiencyLevelConfig
> = {
  beginner: {
    name: "beginner",
    label: labels.proficiency.levels.beginner,
    description: labels.proficiency.levelDescriptions.beginner,
    minScore: 0,
    maxScore: 29,
    color: "text-emerald-700 dark:text-emerald-400",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/40",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    icon: BookOpen,
    progressColor: "bg-emerald-500",
  },
  elementary: {
    name: "elementary",
    label: labels.proficiency.levels.elementary,
    description: labels.proficiency.levelDescriptions.elementary,
    minScore: 30,
    maxScore: 99,
    color: "text-sky-700 dark:text-sky-400",
    badgeBg: "bg-sky-100 dark:bg-sky-900/40",
    badgeText: "text-sky-800 dark:text-sky-300",
    icon: Languages,
    progressColor: "bg-sky-500",
  },
  intermediate: {
    name: "intermediate",
    label: labels.proficiency.levels.intermediate,
    description: labels.proficiency.levelDescriptions.intermediate,
    minScore: 100,
    maxScore: 249,
    color: "text-violet-700 dark:text-violet-400",
    badgeBg: "bg-violet-100 dark:bg-violet-900/40",
    badgeText: "text-violet-800 dark:text-violet-300",
    icon: GraduationCap,
    progressColor: "bg-violet-500",
  },
  upper_intermediate: {
    name: "upper_intermediate",
    label: labels.proficiency.levels.upperIntermediate,
    description: labels.proficiency.levelDescriptions.upperIntermediate,
    minScore: 250,
    maxScore: 499,
    color: "text-amber-700 dark:text-amber-400",
    badgeBg: "bg-amber-100 dark:bg-amber-900/40",
    badgeText: "text-amber-800 dark:text-amber-300",
    icon: Rocket,
    progressColor: "bg-amber-500",
  },
  advanced: {
    name: "advanced",
    label: labels.proficiency.levels.advanced,
    description: labels.proficiency.levelDescriptions.advanced,
    minScore: 500,
    maxScore: null,
    color: "text-rose-700 dark:text-rose-400",
    badgeBg: "bg-rose-100 dark:bg-rose-900/40",
    badgeText: "text-rose-800 dark:text-rose-300",
    icon: Trophy,
    progressColor: "bg-rose-500",
  },
};

const LEVEL_ORDER: ProficiencyLevelName[] = [
  "beginner",
  "elementary",
  "intermediate",
  "upper_intermediate",
  "advanced",
];

export type ProficiencyProgress = {
  currentLevel: ProficiencyLevelConfig;
  nextLevel: ProficiencyLevelConfig | null;
  progress: number;
  scoreToNext: number;
};

export function computeProficiencyGain(
  isCorrect: boolean,
  scorePercent: number | null
): number {
  const raw = scorePercent ?? (isCorrect ? 100 : 0);
  return Math.round(raw / 10);
}

export function getProficiencyLevel(
  score: number
): ProficiencyLevelConfig {
  if (score >= 500) return PROFICIENCY_LEVELS.advanced;
  if (score >= 250) return PROFICIENCY_LEVELS.upper_intermediate;
  if (score >= 100) return PROFICIENCY_LEVELS.intermediate;
  if (score >= 30) return PROFICIENCY_LEVELS.elementary;
  return PROFICIENCY_LEVELS.beginner;
}

export function getProficiencyProgress(score: number): ProficiencyProgress {
  const currentLevel = getProficiencyLevel(score);

  if (currentLevel.maxScore === null) {
    return {
      currentLevel,
      nextLevel: null,
      progress: 100,
      scoreToNext: 0,
    };
  }

  const nextIndex =
    LEVEL_ORDER.indexOf(currentLevel.name) + 1;
  const nextLevel =
    nextIndex < LEVEL_ORDER.length
      ? PROFICIENCY_LEVELS[LEVEL_ORDER[nextIndex]!]
      : null;

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      progress: 100,
      scoreToNext: 0,
    };
  }

  const range = currentLevel.maxScore - currentLevel.minScore + 1;
  const progress = Math.min(
    100,
    Math.round(((score - currentLevel.minScore) / range) * 100)
  );

  return {
    currentLevel,
    nextLevel,
    progress,
    scoreToNext: Math.max(0, nextLevel.minScore - score),
  };
}

export type ProficiencyLevelUpPayload = {
  fromName: string;
  toName: string;
  toLabel: string;
  toDescription: string;
};

export function buildProficiencyLevelKey(levelName: ProficiencyLevelName): string {
  return `proficiency-level:${levelName}`;
}
