"use client";

import type { BadgeWithMeta } from "@/actions/student/badges";
import { BADGE_DEFINITIONS, BADGE_TIER_CONFIG } from "@/lib/badges";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function BadgeCard({
  badge,
  size = "md",
  showProgress = false,
}: {
  badge: BadgeWithMeta;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
}) {
  const definition = BADGE_DEFINITIONS.find((b) => b.key === badge.badgeKey);
  if (!definition) return null;

  const tierConfig = BADGE_TIER_CONFIG[badge.tier as keyof typeof BADGE_TIER_CONFIG];
  const isEarned = badge.unlockedAt !== null;
  const Icon = definition.icon;
  const progress = badge.progress ?? { current: 0, target: 1, percent: 0 };

  const isCompact = size === "sm";

  return (
    <div
      className={cn(
        "group flex transition-all duration-300",
        isCompact
          ? "w-20 flex-col items-center gap-2 rounded-xl border p-2 text-center"
          : "w-full flex-col items-center gap-2.5 rounded-xl border p-3 text-center sm:gap-3 sm:p-4",
        isEarned
          ? `${tierConfig.bg} shadow-sm hover:shadow-md sm:hover:-translate-y-0.5`
          : "border-dashed border-muted-foreground/30 bg-muted/20"
      )}
      title={badge.description}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
          isCompact ? "size-8 rounded-lg" : "size-11 sm:size-12",
          isEarned ? tierConfig.color : "text-muted-foreground/40",
          isEarned && "bg-background/40"
        )}
      >
        <Icon className={isCompact ? "size-4" : "size-5 sm:size-6"} />
      </div>

      <div className="flex min-w-0 w-full flex-1 flex-col items-center">
        <p
          className={cn(
            "line-clamp-2 w-full text-xs font-semibold leading-snug sm:text-sm",
            isEarned ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {badge.label}
        </p>
        {!isCompact && (
          <p
            className={cn(
              "mt-1 text-[10px] font-medium uppercase tracking-wider",
              isEarned ? tierConfig.color : "text-muted-foreground/50"
            )}
          >
            {isEarned ? tierConfig.label : labels.badges.locked}
          </p>
        )}
        {showProgress && !isEarned && !isCompact && (
          <div className="mt-auto w-full pt-2">
            <div className="mx-auto h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] tabular-nums text-muted-foreground">
              {labels.badges.progress(progress.current, progress.target)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function BadgeIconRow({ badges }: { badges: BadgeWithMeta[] }) {
  const earned = badges.filter((b) => b.unlockedAt !== null);

  if (earned.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{labels.badges.noBadges}</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {earned.slice(0, 6).map((badge) => (
        <BadgeCard key={badge.badgeKey} badge={badge} size="sm" />
      ))}
      {earned.length > 6 && (
        <div className="flex items-center text-xs text-muted-foreground">
          +{earned.length - 6} more
        </div>
      )}
    </div>
  );
}
