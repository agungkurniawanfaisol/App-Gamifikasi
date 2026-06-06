import type { BadgeWithMeta } from "@/actions/student/badges";
import { BadgeCard } from "@/components/student/badge-card";
import { BADGE_CATEGORIES, type BadgeCategory } from "@/lib/badges";
import { labels } from "@/lib/labels";

const SECTION_LABELS: Record<BadgeCategory, string> = {
  skill: labels.badges.skillMastery,
  milestone: labels.badges.milestones,
  excellence: labels.badges.excellence,
};

export function BadgeCollection({ badges }: { badges: BadgeWithMeta[] }) {
  const badgeMap = new Map(badges.map((b) => [b.badgeKey, b]));

  return (
    <div className="space-y-8 sm:space-y-10">
      {(Object.keys(BADGE_CATEGORIES) as BadgeCategory[]).map((category) => {
        const keys = BADGE_CATEGORIES[category];
        const sectionBadges = keys
          .map((key) => badgeMap.get(key))
          .filter((b): b is BadgeWithMeta => b != null);

        if (category === "skill") {
          const extraSkill = sectionBadges.filter(
            (b) => b.badgeKey === "speaking-star"
          );
          if (extraSkill.length === 0) return null;
          return (
            <CollectionSection
              key={category}
              title={labels.badges.skillMastery}
              badges={extraSkill}
            />
          );
        }

        return (
          <CollectionSection
            key={category}
            title={SECTION_LABELS[category]}
            badges={sectionBadges}
          />
        );
      })}
    </div>
  );
}

function CollectionSection({
  title,
  badges,
}: {
  title: string;
  badges: BadgeWithMeta[];
}) {
  const earned = badges.filter((b) => b.unlockedAt !== null);
  const locked = badges.filter((b) => b.unlockedAt === null);
  const earnedCount = earned.length;

  return (
    <section className="rounded-2xl border border-border/60 bg-card/40 p-4 sm:border-0 sm:bg-transparent sm:p-0">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h2>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {earnedCount}/{badges.length}
        </span>
      </div>

      {earned.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {labels.badges.sectionEarned}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {earned.map((badge) => (
              <BadgeCard key={badge.badgeKey} badge={badge} size="md" />
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {labels.badges.sectionLocked}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {locked.map((badge) => (
              <BadgeCard
                key={badge.badgeKey}
                badge={badge}
                size="md"
                showProgress
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
