"use client";

import { BadgeCard } from "@/components/student/badge-card";
import type { BadgeWithMeta } from "@/actions/student/badges";
import { labels } from "@/lib/labels";

export function BadgeGrid({ badges }: { badges: BadgeWithMeta[] }) {
  const earned = badges.filter((b) => b.unlockedAt !== null);
  const locked = badges.filter((b) => b.unlockedAt === null);

  return (
    <div className="space-y-8">
      {/* Stats header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{earned.length}</span>
          <span className="text-sm text-muted-foreground">/ {badges.length}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm text-muted-foreground">
          {labels.badges.earned}
        </span>
      </div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
            Earned
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {earned.map((badge) => (
              <BadgeCard key={badge.badgeKey} badge={badge} size="md" />
            ))}
          </div>
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Locked
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {locked.map((badge) => (
              <BadgeCard key={badge.badgeKey} badge={badge} size="md" />
            ))}
          </div>
        </div>
      )}

      {badges.length === 0 && (
        <p className="text-sm text-muted-foreground">{labels.badges.noBadges}</p>
      )}
    </div>
  );
}
