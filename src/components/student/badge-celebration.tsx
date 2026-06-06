"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { BadgeWithMeta } from "@/actions/student/badges";
import {
  BADGE_DEFINITIONS,
  BADGE_TIER_CONFIG,
  SKILL_BADGE_ACCENTS,
  type BadgeKey,
  type BadgeTier,
} from "@/lib/badges";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const TIER_CELEBRATION_GRADIENT: Record<BadgeTier, string> = {
  bronze: "from-amber-500/15 to-amber-500/5",
  silver: "from-slate-400/15 to-slate-400/5",
  gold: "from-yellow-500/15 to-yellow-500/5",
  platinum: "from-teal-500/15 to-teal-500/5",
  diamond: "from-sky-500/15 to-sky-500/5",
};

function CelebrationBadgeCard({
  badge,
  visible,
  delayMs,
}: {
  badge: BadgeWithMeta;
  visible: boolean;
  delayMs: number;
}) {
  const definition = BADGE_DEFINITIONS.find((b) => b.key === badge.badgeKey);
  const tierConfig =
    BADGE_TIER_CONFIG[badge.tier as BadgeTier] ?? BADGE_TIER_CONFIG.bronze;
  const accent = SKILL_BADGE_ACCENTS[badge.badgeKey as BadgeKey];
  const Icon = definition?.icon ?? Sparkles;
  const gradient =
    accent?.gradient || TIER_CELEBRATION_GRADIENT[badge.tier as BadgeTier];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border-2 p-5 shadow-sm transition-all duration-500",
        tierConfig.bg,
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {gradient ? (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-60",
            gradient
          )}
        />
      ) : null}

      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              accent?.iconBg || "bg-background/40",
              accent?.iconColor || tierConfig.color
            )}
          >
            <Icon className="size-6" />
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              tierConfig.bg,
              tierConfig.color
            )}
          >
            {tierConfig.label}
          </span>
        </div>

        <h4 className="text-left text-base font-semibold leading-snug text-foreground">
          {badge.label}
        </h4>
        <p className="mt-1 text-left text-xs leading-relaxed text-muted-foreground">
          {badge.description}
        </p>
      </div>
    </div>
  );
}

export function BadgeCelebrationModal({
  newBadges,
  open,
  onClose,
}: {
  newBadges: BadgeWithMeta[];
  open: boolean;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open || newBadges.length === 0) return null;

  const heroTier =
    BADGE_TIER_CONFIG[newBadges[0].tier as BadgeTier] ?? BADGE_TIER_CONFIG.bronze;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm overflow-visible sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {labels.badges.justUnlocked}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {labels.badges.badgesNew(newBadges.length)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-2 text-center sm:py-4">
          <div
            className={cn(
              "mb-4 flex size-14 items-center justify-center rounded-full",
              heroTier.bg
            )}
          >
            <Sparkles className={cn("size-7", heroTier.color)} />
          </div>

          <h3 className="text-xl font-bold text-foreground">
            {labels.badges.justUnlocked}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {labels.badges.badgesNew(newBadges.length)}
          </p>

          <div className="mt-6 flex w-full flex-col gap-3">
            {newBadges.map((badge, i) => (
              <CelebrationBadgeCard
                key={badge.badgeKey}
                badge={badge}
                visible={visible}
                delayMs={i * 150}
              />
            ))}
          </div>

          <Button onClick={onClose} className="mt-6">
            {labels.student.continue}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
