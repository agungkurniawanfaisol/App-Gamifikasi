import { Award, Sparkles } from "lucide-react";
import type { BadgeOverview } from "@/actions/student/badges";
import { BADGE_TIER_CONFIG } from "@/lib/badges";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { BadgeProgressRing } from "./badge-progress-ring";

export function BadgeHero({ overview }: { overview: BadgeOverview }) {
  const overallPercent =
    overview.totalCount > 0
      ? Math.round((overview.earnedCount / overview.totalCount) * 100)
      : 0;

  const latestTier = overview.latestEarned
    ? BADGE_TIER_CONFIG[
        overview.latestEarned.tier as keyof typeof BADGE_TIER_CONFIG
      ]
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent" />

      <div className="relative z-10 p-4 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <BadgeProgressRing
              percent={overallPercent}
              size={72}
              strokeWidth={6}
              className="shrink-0 sm:hidden"
            >
              <div className="text-center">
                <p className="text-base font-black text-primary">
                  {overview.earnedCount}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  /{overview.totalCount}
                </p>
              </div>
            </BadgeProgressRing>

            <BadgeProgressRing
              percent={overallPercent}
              size={80}
              strokeWidth={7}
              className="hidden shrink-0 sm:inline-flex"
            >
              <div className="text-center">
                <p className="text-lg font-black text-primary">
                  {overview.earnedCount}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  /{overview.totalCount}
                </p>
              </div>
            </BadgeProgressRing>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {labels.badges.earned}
              </p>
              <p className="text-xl font-bold sm:text-2xl">
                {labels.badges.earnedCount(
                  overview.earnedCount,
                  overview.totalCount
                )}
              </p>
              {overview.latestEarned && latestTier && (
                <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Award
                    className={cn("mt-0.5 size-3.5 shrink-0", latestTier.color)}
                  />
                  <span className="line-clamp-2">
                    Latest: {overview.latestEarned.label}
                  </span>
                </p>
              )}
            </div>
          </div>

          {overview.nextUnlock && (
            <div className="w-full rounded-xl border border-border/60 bg-background/70 p-4 sm:max-w-xs sm:flex-1">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="size-3 shrink-0 text-primary" />
                {labels.badges.nextUnlock}
              </p>
              <p className="mt-1 line-clamp-2 font-semibold text-foreground">
                {overview.nextUnlock.label}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-700"
                  style={{ width: `${overview.nextUnlock.progress.percent}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                {labels.badges.progress(
                  overview.nextUnlock.progress.current,
                  overview.nextUnlock.progress.target
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
