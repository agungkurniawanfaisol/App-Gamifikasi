import type { BadgeWithMeta } from "@/actions/student/badges";
import {
  BADGE_DEFINITIONS,
  BADGE_TIER_CONFIG,
  FEATURED_SKILL_BADGE_KEYS,
  SKILL_BADGE_ACCENTS,
  type BadgeKey,
} from "@/lib/badges";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function SkillPillars({ badges }: { badges: BadgeWithMeta[] }) {
  const badgeMap = new Map(badges.map((b) => [b.badgeKey, b]));
  const featured = FEATURED_SKILL_BADGE_KEYS.map((key) => badgeMap.get(key)).filter(
    (b): b is BadgeWithMeta => b != null
  );

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          {labels.badges.skillMastery}
        </h2>
        <span className="text-[10px] font-medium text-muted-foreground sm:hidden">
          Swipe
        </span>
      </div>

      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {featured.map((badge) => (
            <SkillPillarCard key={badge.badgeKey} badge={badge} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillPillarCard({ badge }: { badge: BadgeWithMeta }) {
  const definition = BADGE_DEFINITIONS.find((b) => b.key === badge.badgeKey);
  if (!definition) return null;

  const isEarned = badge.unlockedAt !== null;
  const tierConfig =
    BADGE_TIER_CONFIG[badge.tier as keyof typeof BADGE_TIER_CONFIG];
  const accent = SKILL_BADGE_ACCENTS[badge.badgeKey as BadgeKey];
  const Icon = definition.icon;
  const progress = badge.progress ?? { current: 0, target: 1, percent: 0 };

  return (
    <div
      className={cn(
        "relative w-[min(82vw,17.5rem)] shrink-0 snap-center overflow-hidden rounded-xl border p-4 transition-all sm:w-auto sm:min-w-0 sm:snap-align-none",
        isEarned
          ? cn("border-border bg-card shadow-sm", tierConfig.bg)
          : "border-dashed border-muted-foreground/30 bg-muted/20"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-60",
          accent.gradient
        )}
      />

      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              isEarned ? accent.iconBg : "bg-muted"
            )}
          >
            <Icon
              className={cn(
                "size-5",
                isEarned ? accent.iconColor : "text-muted-foreground/40"
              )}
            />
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              isEarned ? tierConfig.bg : "border-muted-foreground/20 text-muted-foreground"
            )}
          >
            {isEarned ? tierConfig.label : labels.badges.locked}
          </span>
        </div>

        <h3 className="font-semibold leading-snug text-foreground">{badge.label}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {badge.description}
        </p>

        {!isEarned && (
          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
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
