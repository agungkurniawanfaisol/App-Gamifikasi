"use client";

import {
  Award,
  BookOpen,
  Crown,
  Flame,
  Footprints,
  GraduationCap,
  Languages,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import type { AchievementGrantResult } from "@/lib/achievement-engine";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

const ICONS: Record<string, typeof Trophy> = {
  trophy: Trophy,
  target: Target,
  flame: Flame,
  footprints: Footprints,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  languages: Languages,
  rocket: Rocket,
};

function pickHeroReward(grants: AchievementGrantResult[]) {
  for (const grant of grants) {
    const certificate = grant.rewards.find((r) => r.type === "CERTIFICATE");
    if (certificate && certificate.type === "CERTIFICATE") {
      return { kind: "certificate" as const, grant, reward: certificate };
    }
  }
  for (const grant of grants) {
    const premium = grant.rewards.find((r) => r.type === "PREMIUM_UNLOCK");
    if (premium && premium.type === "PREMIUM_UNLOCK") {
      return { kind: "premium" as const, grant, reward: premium };
    }
  }
  return null;
}

export function RewardCelebrationModal({
  grants,
  open,
  onClose,
}: {
  grants: AchievementGrantResult[];
  open: boolean;
  onClose: () => void;
}) {
  if (!open || grants.length === 0) return null;

  const hero = pickHeroReward(grants);
  const bonusPoints = grants.flatMap((g) =>
    g.rewards.filter((r) => r.type === "BONUS_POINTS")
  );
  const totalBonus = bonusPoints.reduce(
    (sum, r) => (r.type === "BONUS_POINTS" ? sum + r.points : sum),
    0
  );

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent className="max-w-md overflow-visible">
        <DialogHeader>
          <DialogTitle className="sr-only">{labels.rewards.unlockedTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {labels.rewards.unlockedSubtitle}
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-7 text-primary" />
          </div>

          <h3 className="text-xl font-bold">{labels.rewards.unlockedTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {labels.rewards.unlockedSubtitle}
          </p>

          {hero?.kind === "certificate" && (
            <div className="mt-6 w-full rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-primary/5 p-6 shadow-sm">
              <Award className="mx-auto size-10 text-amber-600 dark:text-amber-400" />
              <p className="mt-3 text-lg font-bold">{hero.reward.templateTitle}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {hero.reward.certificateNumber}
              </p>
              <p className="mt-3 text-sm font-semibold text-primary">
                {hero.grant.title}
              </p>
            </div>
          )}

          {hero?.kind === "premium" && (
            <div className="mt-6 w-full rounded-xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-background to-fuchsia-500/5 p-6 shadow-sm">
              <Crown className="mx-auto size-10 text-violet-600 dark:text-violet-400" />
              <p className="mt-3 text-lg font-bold">
                {labels.rewards.premiumUnlocked}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {labels.rewards.premiumUnlockedHint(hero.reward.levelLabel)}
              </p>
              <p className="mt-3 text-sm font-semibold text-primary">
                {hero.grant.title}
              </p>
            </div>
          )}

          {!hero && grants.length > 0 && (
            <div className="mt-6 w-full space-y-3">
              {grants.map((grant) => {
                const Icon = ICONS[grant.iconKey] ?? Trophy;
                return (
                  <div
                    key={grant.slug}
                    className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-3 text-left"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{grant.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {grant.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalBonus > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-points/10 px-4 py-2 text-sm font-semibold text-points">
              <Sparkles className="size-4" />
              {labels.rewards.bonusPoints(totalBonus)}
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/rewards">{labels.rewards.viewAll}</Link>
            </Button>
            <Button size="sm" onClick={onClose}>
              {labels.student.continue}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
