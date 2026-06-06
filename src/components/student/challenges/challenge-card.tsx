import {
  Calendar,
  Mic,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { UserChallengeStatus } from "@prisma/client";
import type { ActiveChallengeView } from "@/lib/challenge-queries";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  sun: Sun,
  calendar: Calendar,
  mic: Mic,
  target: Target,
};

function formatTimeLeft(endsAt: Date): string {
  const diff = endsAt.getTime() - Date.now();
  if (diff <= 0) return labels.challenges.endingSoon;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return labels.challenges.timeLeftDays(days);
  }
  if (hours > 0) {
    return labels.challenges.timeLeftHours(hours);
  }
  return labels.challenges.timeLeftMinutes(Math.max(1, Math.floor(diff / 60000)));
}

export function ChallengeCard({ challenge }: { challenge: ActiveChallengeView }) {
  const Icon = iconMap[challenge.iconKey] ?? Target;
  const isDone = challenge.status === UserChallengeStatus.REWARDED;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md",
        isDone && "border-success/30 bg-success/5"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-primary to-violet-400 opacity-80" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Icon className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">
                  {challenge.title}
                </h3>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {challenge.recurrenceLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {challenge.description}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {labels.challenges.reward}
            </p>
            <p className="text-xl font-bold text-points">
              +{challenge.pointReward}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isDone
              ? labels.challenges.statusDone
              : labels.challenges.statusActive}
          </span>
          <span>{formatTimeLeft(challenge.endsAt)}</span>
        </div>

        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              isDone
                ? "bg-success"
                : "bg-gradient-to-r from-amber-400 to-primary"
            )}
            style={{ width: `${challenge.progressPercent}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs font-medium text-muted-foreground">
          {challenge.progressPercent}%
        </p>

        <ul className="mt-4 space-y-2">
          {challenge.objectives.map((objective, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm"
            >
              <span
                className={cn(
                  objective.done && "text-success line-through decoration-success/50"
                )}
              >
                {objective.label}
              </span>
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  objective.done ? "text-success" : "text-foreground"
                )}
              >
                {objective.current}/{objective.target}
              </span>
            </li>
          ))}
        </ul>

        {challenge.playHref && !isDone && (
          <Link
            href={challenge.playHref}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {labels.challenges.startDaily}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </article>
  );
}
