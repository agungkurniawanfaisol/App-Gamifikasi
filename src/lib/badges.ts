import {
  BookOpen,
  Flame,
  Footprints,
  Gem,
  Headphones,
  Search,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { QuestionSkill } from "@prisma/client";

// ─── Types ──────────────────────────────────────────────────────────

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export type BadgeCategory = "skill" | "milestone" | "excellence";

export type BadgeKey =
  | "first-step"
  | "quick-learner"
  | "vocab-hunter"
  | "reading-champion"
  | "grammar-master"
  | "speaking-star"
  | "listening-expert"
  | "perfect-score"
  | "streak-master"
  | "centurion"
  | "champion"
  | "eagle-eye";

export type BadgeDefinition = {
  key: BadgeKey;
  label: string;
  description: string;
  icon: LucideIcon;
  tier: BadgeTier;
  category: BadgeCategory;
  check: (stats: UserBadgeStats) => boolean;
};

export type BadgeProgress = {
  current: number;
  target: number;
  percent: number;
};

export type UserBadgeStats = {
  totalPoints: number;
  groupsCompleted: number;
  groupsInLevel: Map<number, number>;
  totalGroupsByLevel: Map<number, number>;
  answersBySkill: Record<QuestionSkill, { total: number; correct: number }>;
  speechScores: number[];
  perfectGroupIds: number[];
  consecutiveCompleted: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
};

export type UserBadgeEntry = {
  badgeKey: BadgeKey;
  unlockedAt: Date;
  notified: boolean;
};

export const FEATURED_SKILL_BADGE_KEYS: BadgeKey[] = [
  "vocab-hunter",
  "reading-champion",
  "grammar-master",
  "listening-expert",
];

export const SKILL_BADGE_KEYS: BadgeKey[] = [
  ...FEATURED_SKILL_BADGE_KEYS,
  "speaking-star",
];

export const BADGE_CATEGORIES: Record<BadgeCategory, BadgeKey[]> = {
  skill: SKILL_BADGE_KEYS,
  milestone: ["first-step", "quick-learner", "streak-master"],
  excellence: ["perfect-score", "centurion", "champion", "eagle-eye"],
};

// ─── Badge Tier Config ──────────────────────────────────────────────

export const BADGE_TIER_CONFIG: Record<
  BadgeTier,
  { color: string; bg: string; label: string }
> = {
  bronze: {
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800",
    label: "Bronze",
  },
  silver: {
    color: "text-slate-500 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
    label: "Silver",
  },
  gold: {
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800",
    label: "Gold",
  },
  platinum: {
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-100 dark:bg-teal-900/40 border-teal-200 dark:border-teal-800",
    label: "Platinum",
  },
  diamond: {
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/40 border-sky-200 dark:border-sky-700",
    label: "Diamond",
  },
};

export const SKILL_BADGE_ACCENTS: Record<
  BadgeKey,
  { gradient: string; iconBg: string; iconColor: string }
> = {
  "vocab-hunter": {
    gradient: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  "reading-champion": {
    gradient: "from-emerald-500/15 to-teal-500/5",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-700 dark:text-emerald-300",
  },
  "grammar-master": {
    gradient: "from-violet-500/10 to-violet-500/5",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  "listening-expert": {
    gradient: "from-amber-500/10 to-amber-500/5",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  "speaking-star": {
    gradient: "from-rose-500/10 to-rose-500/5",
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  "first-step": { gradient: "", iconBg: "", iconColor: "" },
  "quick-learner": { gradient: "", iconBg: "", iconColor: "" },
  "perfect-score": { gradient: "", iconBg: "", iconColor: "" },
  "streak-master": { gradient: "", iconBg: "", iconColor: "" },
  centurion: { gradient: "", iconBg: "", iconColor: "" },
  champion: { gradient: "", iconBg: "", iconColor: "" },
  "eagle-eye": { gradient: "", iconBg: "", iconColor: "" },
};

// ─── Badge Definitions ──────────────────────────────────────────────

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    key: "first-step",
    label: "First Step",
    description: "Complete your first learning group",
    icon: Footprints,
    tier: "bronze",
    category: "milestone",
    check: (stats) => stats.groupsCompleted >= 1,
  },
  {
    key: "quick-learner",
    label: "Quick Learner",
    description: "Complete 3 learning groups",
    icon: BookOpen,
    tier: "silver",
    category: "milestone",
    check: (stats) => stats.groupsCompleted >= 3,
  },
  {
    key: "vocab-hunter",
    label: "Vocabulary Hunter",
    description: "Answer 10 Reading questions correctly",
    icon: Search,
    tier: "silver",
    category: "skill",
    check: (stats) => (stats.answersBySkill.READING?.correct ?? 0) >= 10,
  },
  {
    key: "reading-champion",
    label: "Reading Champion",
    description: "Answer 25 Reading questions correctly",
    icon: BookOpen,
    tier: "gold",
    category: "skill",
    check: (stats) => (stats.answersBySkill.READING?.correct ?? 0) >= 25,
  },
  {
    key: "grammar-master",
    label: "Grammar Master",
    description: "Answer 15 Writing questions correctly",
    icon: BookOpen,
    tier: "gold",
    category: "skill",
    check: (stats) => (stats.answersBySkill.WRITING?.correct ?? 0) >= 15,
  },
  {
    key: "speaking-star",
    label: "Speaking Star",
    description: "Score 90%+ on 10 speech recognition exercises",
    icon: Star,
    tier: "silver",
    category: "skill",
    check: (stats) => stats.speechScores.filter((s) => s >= 90).length >= 10,
  },
  {
    key: "listening-expert",
    label: "Listening Expert",
    description: "Answer 15 Listening questions correctly",
    icon: Headphones,
    tier: "gold",
    category: "skill",
    check: (stats) => (stats.answersBySkill.LISTENING?.correct ?? 0) >= 15,
  },
  {
    key: "perfect-score",
    label: "Perfect Score",
    description: "Complete a group with all questions answered correctly",
    icon: Target,
    tier: "silver",
    category: "excellence",
    check: (stats) => stats.perfectGroupIds.length >= 1,
  },
  {
    key: "streak-master",
    label: "Streak Master",
    description: "Complete 3 groups in a row",
    icon: Flame,
    tier: "gold",
    category: "milestone",
    check: (stats) => stats.consecutiveCompleted >= 3,
  },
  {
    key: "centurion",
    label: "Centurion",
    description: "Earn 500 points",
    icon: Gem,
    tier: "platinum",
    category: "excellence",
    check: (stats) => stats.totalPoints >= 500,
  },
  {
    key: "champion",
    label: "Champion",
    description: "Complete all groups in one level",
    icon: Trophy,
    tier: "diamond",
    category: "excellence",
    check: (stats) =>
      Array.from(stats.groupsInLevel.entries()).some(([levelId, completed]) => {
        const total = stats.totalGroupsByLevel.get(levelId) ?? 0;
        return total > 0 && completed >= total;
      }),
  },
  {
    key: "eagle-eye",
    label: "Eagle Eye",
    description: "90%+ accuracy across 20+ questions",
    icon: Target,
    tier: "platinum",
    category: "excellence",
    check: (stats) =>
      stats.totalQuestionsAnswered >= 20 &&
      stats.totalCorrect / stats.totalQuestionsAnswered >= 0.9,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

export function getBadgeByKey(key: BadgeKey): BadgeDefinition {
  const badge = BADGE_DEFINITIONS.find((b) => b.key === key);
  if (!badge) throw new Error(`Badge not found: ${key}`);
  return badge;
}

export function computeNewBadges(
  stats: UserBadgeStats,
  existingKeys: Set<BadgeKey>
): BadgeKey[] {
  const newlyUnlocked: BadgeKey[] = [];
  for (const badge of BADGE_DEFINITIONS) {
    if (existingKeys.has(badge.key)) continue;
    if (badge.check(stats)) {
      newlyUnlocked.push(badge.key);
    }
  }
  return newlyUnlocked;
}

function clampPercent(current: number, target: number): BadgeProgress {
  if (target <= 0) return { current, target: 1, percent: 100 };
  const percent = Math.min(100, Math.round((current / target) * 100));
  return { current: Math.min(current, target), target, percent };
}

export function getBadgeProgress(
  key: BadgeKey,
  stats: UserBadgeStats
): BadgeProgress {
  switch (key) {
    case "vocab-hunter":
      return clampPercent(stats.answersBySkill.READING?.correct ?? 0, 10);
    case "reading-champion":
      return clampPercent(stats.answersBySkill.READING?.correct ?? 0, 25);
    case "grammar-master":
      return clampPercent(stats.answersBySkill.WRITING?.correct ?? 0, 15);
    case "listening-expert":
      return clampPercent(stats.answersBySkill.LISTENING?.correct ?? 0, 15);
    case "speaking-star":
      return clampPercent(
        stats.speechScores.filter((s) => s >= 90).length,
        10
      );
    case "first-step":
      return clampPercent(stats.groupsCompleted, 1);
    case "quick-learner":
      return clampPercent(stats.groupsCompleted, 3);
    case "perfect-score":
      return clampPercent(stats.perfectGroupIds.length, 1);
    case "streak-master":
      return clampPercent(stats.consecutiveCompleted, 3);
    case "centurion":
      return clampPercent(stats.totalPoints, 500);
    case "champion": {
      let best = 0;
      for (const [levelId, completed] of Array.from(stats.groupsInLevel.entries())) {
        const total = stats.totalGroupsByLevel.get(levelId) ?? 0;
        if (total > 0) {
          best = Math.max(best, Math.round((completed / total) * 100));
        }
      }
      return { current: best, target: 100, percent: best };
    }
    case "eagle-eye": {
      const questions = stats.totalQuestionsAnswered;
      const accuracy =
        questions > 0 ? stats.totalCorrect / questions : 0;
      const questionProgress = clampPercent(questions, 20);
      const accuracyProgress = clampPercent(Math.round(accuracy * 100), 90);
      return {
        current: questionProgress.current,
        target: questionProgress.target,
        percent: Math.min(questionProgress.percent, accuracyProgress.percent),
      };
    }
    default:
      return { current: 0, target: 1, percent: 0 };
  }
}

export function getNextUnlockBadge(
  stats: UserBadgeStats,
  existingKeys: Set<BadgeKey>
): { key: BadgeKey; progress: BadgeProgress } | null {
  let best: { key: BadgeKey; progress: BadgeProgress } | null = null;

  for (const badge of BADGE_DEFINITIONS) {
    if (existingKeys.has(badge.key)) continue;
    const progress = getBadgeProgress(badge.key, stats);
    if (progress.percent >= 100) continue;
    if (!best || progress.percent > best.progress.percent) {
      best = { key: badge.key, progress };
    }
  }

  return best;
}

// ─── Build Stats from DB Results ────────────────────────────────────

export type ProgressWithGroup = {
  groupId: number;
  isGroupCompleted: boolean;
  completedAt: Date | null;
  group: { levelId: number; order: number };
};

export type AnswerWithSkill = {
  isCorrect: boolean;
  scorePercent: number | null;
  contentItem: { skill: QuestionSkill | null; groupId: number };
};

export function buildUserBadgeStats(params: {
  user: { points: number };
  progress: ProgressWithGroup[];
  answers: AnswerWithSkill[];
  totalGroupsByLevel: Map<number, number>;
}): UserBadgeStats {
  const { user, progress, answers, totalGroupsByLevel } = params;

  const completedProgress = progress.filter((p) => p.isGroupCompleted);
  const groupsCompleted = completedProgress.length;
  const completedGroupIds = new Set(completedProgress.map((p) => p.groupId));

  const groupsInLevel = new Map<number, number>();
  for (const p of completedProgress) {
    const count = groupsInLevel.get(p.group.levelId) ?? 0;
    groupsInLevel.set(p.group.levelId, count + 1);
  }

  const answersBySkill: Record<string, { total: number; correct: number }> = {};
  for (const a of answers) {
    const skill = a.contentItem.skill ?? "READING";
    if (!answersBySkill[skill]) answersBySkill[skill] = { total: 0, correct: 0 };
    answersBySkill[skill].total++;
    if (a.isCorrect) answersBySkill[skill].correct++;
  }

  const speechScores: number[] = answers
    .filter(
      (a) =>
        a.contentItem.skill === "SPEAKING" && a.scorePercent != null
    )
    .map((a) => a.scorePercent!);

  const answersByGroup = new Map<number, AnswerWithSkill[]>();
  for (const a of answers) {
    const groupId = a.contentItem.groupId;
    const list = answersByGroup.get(groupId) ?? [];
    list.push(a);
    answersByGroup.set(groupId, list);
  }

  const perfectGroupIds: number[] = [];
  for (const groupId of completedGroupIds) {
    const groupAnswers = answersByGroup.get(groupId) ?? [];
    if (groupAnswers.length > 0 && groupAnswers.every((a) => a.isCorrect)) {
      perfectGroupIds.push(groupId);
    }
  }

  const sortedProgress = [...completedProgress].sort(
    (a, b) => a.group.order - b.group.order
  );
  let consecutive = 0;
  for (const p of sortedProgress) {
    if (p.isGroupCompleted) consecutive++;
    else break;
  }

  const totalQuestionsAnswered = answers.length;
  const totalCorrect = answers.filter((a) => a.isCorrect).length;

  return {
    totalPoints: user.points,
    groupsCompleted,
    groupsInLevel,
    totalGroupsByLevel,
    answersBySkill: answersBySkill as Record<
      QuestionSkill,
      { total: number; correct: number }
    >,
    speechScores,
    perfectGroupIds,
    consecutiveCompleted: consecutive,
    totalQuestionsAnswered,
    totalCorrect,
  };
}
