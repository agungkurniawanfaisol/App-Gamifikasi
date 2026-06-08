import {
  Crown,
  Gem,
  Medal,
  Shield,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { labels } from "@/lib/labels";

export type TierName =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master";

export type TierConfig = {
  name: TierName;
  label: string;
  range: string;
  minPoints: number;
  maxPoints: number | null;
  color: string;
  bgGradient: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: LucideIcon;
  progressColor: string;
};

export const TIERS: Record<TierName, TierConfig> = {
  bronze: {
    name: "bronze",
    label: labels.ranking.tiers.bronze,
    range: labels.ranking.tierDescriptions.bronze,
    minPoints: 0,
    maxPoints: 99,
    color: "text-amber-700 dark:text-amber-300",
    bgGradient: "from-amber-900/20 via-amber-800/10 to-transparent",
    badgeBg: "bg-amber-100 dark:bg-amber-500/20",
    badgeText: "text-amber-900 dark:text-amber-100",
    badgeBorder: "border-amber-300/70 dark:border-amber-400/50",
    icon: Shield,
    progressColor: "bg-amber-500",
  },
  silver: {
    name: "silver",
    label: labels.ranking.tiers.silver,
    range: labels.ranking.tierDescriptions.silver,
    minPoints: 100,
    maxPoints: 299,
    color: "text-slate-600 dark:text-slate-200",
    bgGradient: "from-slate-500/20 via-slate-400/10 to-transparent",
    badgeBg: "bg-slate-100 dark:bg-slate-400/15",
    badgeText: "text-slate-700 dark:text-slate-100",
    badgeBorder: "border-slate-300/70 dark:border-slate-400/55",
    icon: Medal,
    progressColor: "bg-slate-400",
  },
  gold: {
    name: "gold",
    label: labels.ranking.tiers.gold,
    range: labels.ranking.tierDescriptions.gold,
    minPoints: 300,
    maxPoints: 599,
    color: "text-yellow-700 dark:text-yellow-200",
    bgGradient: "from-yellow-500/20 via-yellow-400/10 to-transparent",
    badgeBg: "bg-yellow-100 dark:bg-yellow-500/20",
    badgeText: "text-yellow-900 dark:text-yellow-50",
    badgeBorder: "border-yellow-300/70 dark:border-yellow-400/50",
    icon: Crown,
    progressColor: "bg-yellow-500",
  },
  platinum: {
    name: "platinum",
    label: labels.ranking.tiers.platinum,
    range: labels.ranking.tierDescriptions.platinum,
    minPoints: 600,
    maxPoints: 999,
    color: "text-teal-700 dark:text-teal-200",
    bgGradient: "from-teal-500/20 via-teal-400/10 to-transparent",
    badgeBg: "bg-teal-100 dark:bg-teal-500/20",
    badgeText: "text-teal-900 dark:text-teal-50",
    badgeBorder: "border-teal-300/70 dark:border-teal-400/50",
    icon: Gem,
    progressColor: "bg-teal-500",
  },
  diamond: {
    name: "diamond",
    label: labels.ranking.tiers.diamond,
    range: labels.ranking.tierDescriptions.diamond,
    minPoints: 1000,
    maxPoints: 1499,
    color: "text-sky-700 dark:text-sky-200",
    bgGradient: "from-sky-500/20 via-blue-400/10 to-transparent",
    badgeBg: "bg-sky-100 dark:bg-sky-500/20",
    badgeText: "text-sky-900 dark:text-sky-50",
    badgeBorder: "border-sky-300/70 dark:border-sky-400/50",
    icon: Star,
    progressColor: "bg-sky-500",
  },
  master: {
    name: "master",
    label: labels.ranking.tiers.master,
    range: labels.ranking.tierDescriptions.master,
    minPoints: 1500,
    maxPoints: null,
    color: "text-violet-700 dark:text-violet-200",
    bgGradient: "from-violet-500/20 via-purple-400/10 to-transparent",
    badgeBg: "bg-violet-100 dark:bg-violet-500/20",
    badgeText: "text-violet-900 dark:text-violet-50",
    badgeBorder: "border-violet-300/70 dark:border-violet-400/50",
    icon: Zap,
    progressColor: "bg-violet-500",
  },
};

export type LeaderboardUser = {
  id: number;
  name: string;
  points: number;
  institution: string | null;
  groupsCompleted: number;
};

export type LeaderboardEntry = LeaderboardUser & { rank: number };

export type LeaderboardResult = {
  entries: LeaderboardEntry[];
  topThree: LeaderboardEntry[];
  currentUser: LeaderboardEntry | undefined;
  currentUserRank: number;
  totalParticipants: number;
};

export type TierProgress = {
  currentTier: TierConfig;
  nextTier: TierConfig | null;
  progress: number;
};

export function getTier(points: number): TierConfig {
  if (points >= 1500) return TIERS.master;
  if (points >= 1000) return TIERS.diamond;
  if (points >= 600) return TIERS.platinum;
  if (points >= 300) return TIERS.gold;
  if (points >= 100) return TIERS.silver;
  return TIERS.bronze;
}

export function getTierProgress(points: number): TierProgress {
  const currentTier = getTier(points);
  if (currentTier.maxPoints === null) {
    return { currentTier, nextTier: null, progress: 100 };
  }
  const nextMin = currentTier.maxPoints + 1;
  const nextTier = getTier(nextMin);
  if (nextTier.name === currentTier.name) {
    return { currentTier, nextTier: null, progress: 100 };
  }
  const range = currentTier.maxPoints - currentTier.minPoints || 100;
  const progress = Math.min(
    100,
    Math.round(((points - currentTier.minPoints) / range) * 100)
  );
  return { currentTier, nextTier, progress };
}

export function getRankIcon(rank: number): {
  icon: LucideIcon;
  className: string;
} | null {
  if (rank === 1) {
    return {
      icon: Crown,
      className: "text-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]",
    };
  }
  if (rank === 2) {
    return {
      icon: Medal,
      className: "text-slate-400 drop-shadow-[0_0_4px_rgba(148,163,184,0.4)]",
    };
  }
  if (rank === 3) {
    return {
      icon: Medal,
      className: "text-amber-600 drop-shadow-[0_0_4px_rgba(217,119,6,0.4)]",
    };
  }
  return null;
}

export function getPodiumHeight(rank: number): string {
  if (rank === 1) return "h-44";
  if (rank === 2) return "h-36";
  return "h-28";
}

export function getPodiumGradient(rank: number): string {
  if (rank === 1) {
    return "from-yellow-500/30 via-yellow-500/15 to-yellow-500/5 border-yellow-500/30";
  }
  if (rank === 2) {
    return "from-slate-400/30 via-slate-400/15 to-slate-400/5 border-slate-400/30";
  }
  return "from-amber-600/30 via-amber-600/15 to-amber-600/5 border-amber-600/30";
}

export function getPodiumIcon(rank: number): {
  icon: LucideIcon;
  className: string;
} {
  if (rank === 1) {
    return { icon: Crown, className: "text-yellow-500 size-8" };
  }
  if (rank === 2) {
    return { icon: Medal, className: "text-slate-400 size-7" };
  }
  return { icon: Medal, className: "text-amber-600 size-7" };
}

export function getRowHighlightGradient(rank: number): string | undefined {
  if (rank === 1) {
    return "linear-gradient(to right, transparent, rgba(234,179,8,0.03))";
  }
  if (rank === 2) {
    return "linear-gradient(to right, transparent, rgba(148,163,184,0.03))";
  }
  if (rank === 3) {
    return "linear-gradient(to right, transparent, rgba(217,119,6,0.03))";
  }
  return undefined;
}

export function buildLeaderboard(
  users: LeaderboardUser[],
  currentUserId: number
): LeaderboardResult {
  const entries: LeaderboardEntry[] = users.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));

  const currentUser = entries.find((user) => user.id === currentUserId);
  const topThree = entries.slice(0, 3);

  return {
    entries,
    topThree,
    currentUser,
    currentUserRank: currentUser?.rank ?? 0,
    totalParticipants: entries.length,
  };
}

export function formatRankSummary(rank: number, tier: TierConfig): string {
  return labels.ranking.rankSummary(rank, tier.label);
}
