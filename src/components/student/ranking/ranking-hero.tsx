import { Crown, Sparkles, TrendingUp } from "lucide-react";
import { labels } from "@/lib/labels";
import {
  getRankIcon,
  getTierProgress,
  type LeaderboardEntry,
} from "@/lib/ranking";
import { cn } from "@/lib/utils";

export function RankingHero({
  currentUser,
  currentUserRank,
  totalParticipants,
}: {
  currentUser: LeaderboardEntry | undefined;
  currentUserRank: number;
  totalParticipants: number;
}) {
  const points = currentUser?.points ?? 0;
  const groupsCompleted = currentUser?.groupsCompleted ?? 0;
  const { currentTier, nextTier, progress } = getTierProgress(points);
  const TierIcon = currentTier.icon;
  const rankIcon = currentUserRank > 0 ? getRankIcon(currentUserRank) : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          currentTier.bgGradient
        )}
      />

      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
              {rankIcon && currentUserRank <= 3 ? (
                (() => {
                  const RankIcon = rankIcon.icon;
                  return <RankIcon className={cn("size-8", rankIcon.className)} />;
                })()
              ) : (
                <span className="text-2xl font-black text-primary">
                  #{currentUserRank || "—"}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {labels.ranking.yourRank}
              </p>
              <p className="text-2xl font-bold">
                {currentUserRank > 0
                  ? labels.ranking.rankOf(currentUserRank, totalParticipants)
                  : "—"}
              </p>
              {groupsCompleted > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {labels.ranking.groupsCompletedStat(groupsCompleted)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/50 px-5 py-3 backdrop-blur-sm">
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-xl",
                currentTier.badgeBg
              )}
            >
              <TierIcon className={cn("size-6", currentTier.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {labels.ranking.yourTier}
              </p>
              <p className={cn("text-lg font-bold", currentTier.color)}>
                {currentTier.label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-5 py-3 backdrop-blur-sm">
            <div className="flex size-12 items-center justify-center rounded-xl bg-points/10">
              <Sparkles className="size-6 text-points" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {labels.ranking.yourPoints}
              </p>
              <p className="text-lg font-bold text-points-foreground">
                {labels.ranking.points(points)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span
              className={cn("flex items-center gap-1.5 font-semibold", currentTier.color)}
            >
              <TierIcon className="size-4" />
              {currentTier.label}
            </span>
            {nextTier ? (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="size-3.5" />
                {labels.ranking.nextTier(nextTier.minPoints - points)}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-violet-500">
                <Crown className="size-3.5" />
                {labels.ranking.maxTier}
              </span>
            )}
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                currentTier.progressColor
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          {nextTier && (
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{currentTier.range}</span>
              <span>{nextTier.range}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
