"use client";

import Link from "next/link";
import { BookOpen, Medal, Trophy } from "lucide-react";
import type { ProfileSummary } from "@/lib/user-profile";
import type { ProficiencySummary } from "@/lib/proficiency-queries";
import type { UserRankSummary } from "@/lib/ranking-queries";
import { ProfileAvatarEditor } from "@/components/student/profile/profile-avatar-editor";
import { UserAvatar } from "@/components/layout/user-avatar";
import { ProficiencyBadge } from "@/components/student/proficiency/proficiency-card";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

type ProfileHeroProps = {
  profile: ProfileSummary;
  proficiencySummary: ProficiencySummary;
  rankSummary: UserRankSummary | null;
  onImageUrlChange?: (url: string) => void;
};

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-start gap-3 rounded-xl border border-border/70 bg-muted/15 p-4",
        className
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-lg font-bold tabular-nums">{value}</p>
        {hint ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function ProfileHero({
  profile,
  proficiencySummary,
  rankSummary,
  onImageUrlChange,
}: ProfileHeroProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="relative p-4 sm:p-6">
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/5" />
        <div className="absolute -bottom-10 -left-6 size-24 rounded-full bg-amber-500/5" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-center">
            {onImageUrlChange ? (
              <ProfileAvatarEditor
                name={profile.name}
                imageUrl={profile.profileImageUrl}
                onImageUrlChange={onImageUrlChange}
              />
            ) : (
              <UserAvatar
                name={profile.name}
                imageUrl={profile.profileImageUrl}
                size="xl"
              />
            )}
            <div className="min-w-0 text-center sm:text-left">
              <h2 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                {profile.name}
              </h2>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {profile.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <ProficiencyBadge summary={proficiencySummary} />
                <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {labels.header.roleStudent}
                </span>
              </div>
            </div>
          </div>

          <Button
            asChild
            className="min-h-11 w-full shrink-0 sm:w-auto"
          >
            <Link href="/dashboard/learn" className="gap-2">
              <BookOpen className="size-4" />
              {labels.profile.continueLearning}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-border bg-muted/10 p-4 sm:grid-cols-3 sm:p-5">
        <StatTile
          icon={Trophy}
          label={labels.profile.pointsLabel}
          value={labels.nav.points(profile.points)}
        />
        <StatTile
          icon={Medal}
          label={labels.profile.rankLabel}
          value={
            rankSummary
              ? labels.profile.rankValue(
                  rankSummary.rank,
                  rankSummary.tier.label
                )
              : labels.profile.rankUnranked
          }
          hint={
            rankSummary
              ? labels.ranking.rankOf(
                  rankSummary.rank,
                  rankSummary.totalParticipants
                )
              : undefined
          }
        />
        <StatTile
          icon={BookOpen}
          label={labels.proficiency.title}
          value={proficiencySummary.level.label}
          hint={labels.proficiency.score(proficiencySummary.score)}
        />
      </div>
    </section>
  );
}
