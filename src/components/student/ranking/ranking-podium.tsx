import { Crown } from "lucide-react";
import { labels } from "@/lib/labels";
import {
  getPodiumGradient,
  getPodiumHeight,
  getPodiumIcon,
  getTier,
  type LeaderboardEntry,
} from "@/lib/ranking";
import { cn } from "@/lib/utils";
import { RankingTierBadge } from "@/components/student/ranking/ranking-tier-badge";

function PodiumItem({ user, rank }: { user: LeaderboardEntry; rank: number }) {
  const { icon: PodiumIcon, className: podiumIconClass } = getPodiumIcon(rank);
  const tier = getTier(user.points);

  return (
    <div className="flex min-w-[100px] flex-col items-center gap-3 animate-slide-up">
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={cn(
            "relative flex size-14 items-center justify-center rounded-full text-xl font-bold shadow-lg ring-2",
            rank === 1 &&
              "bg-yellow-100 text-yellow-700 ring-yellow-400/50 dark:bg-yellow-900/30 dark:text-yellow-300",
            rank === 2 &&
              "bg-slate-100 text-slate-600 ring-slate-400/50 dark:bg-slate-800/30 dark:text-slate-300",
            rank === 3 &&
              "bg-amber-100 text-amber-700 ring-amber-600/50 dark:bg-amber-900/30 dark:text-amber-300"
          )}
        >
          {user.name.charAt(0).toUpperCase()}
          <div
            className={cn(
              "absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full text-[10px] font-bold shadow-md ring-2 ring-card",
              rank === 1 && "bg-yellow-500 text-white",
              rank === 2 && "bg-slate-400 text-white",
              rank === 3 && "bg-amber-600 text-white"
            )}
          >
            {rank}
          </div>
        </div>
        <p className="max-w-[100px] truncate text-center text-sm font-semibold">
          {user.name}
        </p>
        <RankingTierBadge tier={tier} showOnMobile />
      </div>

      <div
        className={cn(
          "flex w-full flex-col items-center justify-end rounded-t-xl border bg-gradient-to-t px-4 pb-3 pt-4",
          getPodiumGradient(rank),
          getPodiumHeight(rank)
        )}
        style={{ animationDelay: `${rank * 150}ms` }}
      >
        <PodiumIcon className={cn(podiumIconClass, "mb-1")} />
        <span className="text-lg font-black tabular-nums">{user.points}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {labels.ranking.pts}
        </span>
      </div>
    </div>
  );
}

export function RankingPodium({ topThree }: { topThree: LeaderboardEntry[] }) {
  if (topThree.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="mb-2 flex items-center justify-between gap-2 text-lg font-bold sm:mb-6">
        <span className="flex items-center gap-2">
          <Crown className="size-5 text-yellow-500" />
          {labels.ranking.podium}
        </span>
        <span className="text-xs font-medium text-muted-foreground sm:hidden">
          {labels.badges.swipeHint}
        </span>
      </h2>

      <div className="-mx-2 overflow-x-auto px-2 pb-1 pt-1 sm:pt-3">
        <div className="flex min-w-min items-end justify-center gap-4 sm:gap-6">
          {topThree[1] && <PodiumItem user={topThree[1]} rank={2} />}
          {topThree[0] && <PodiumItem user={topThree[0]} rank={1} />}
          {topThree[2] && <PodiumItem user={topThree[2]} rank={3} />}
        </div>
      </div>
    </div>
  );
}
