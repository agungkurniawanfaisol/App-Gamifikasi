import { labels } from "@/lib/labels";
import type { ProficiencySummary } from "@/lib/proficiency-queries";
import { cn } from "@/lib/utils";

export function ProficiencyBadge({
  summary,
  compact = false,
  className,
}: {
  summary: ProficiencySummary;
  compact?: boolean;
  className?: string;
}) {
  const LevelIcon = summary.level.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        summary.level.badgeBg,
        className
      )}
      title={summary.level.description}
    >
      <LevelIcon className={cn("size-3.5 shrink-0", summary.level.color)} />
      <span className={cn("font-semibold", summary.level.badgeText, compact ? "text-[10px]" : "text-xs")}>
        {summary.level.label}
      </span>
    </div>
  );
}

export function ProficiencyCard({
  summary,
  className,
}: {
  summary: ProficiencySummary;
  className?: string;
}) {
  const LevelIcon = summary.level.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="absolute -right-4 -top-4 size-16 rounded-full bg-primary/5" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {labels.proficiency.title}
          </p>
          <p className={cn("mt-1 text-xl font-bold", summary.level.color)}>
            {summary.level.label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {labels.proficiency.score(summary.score)}
          </p>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            summary.level.badgeBg
          )}
        >
          <LevelIcon className={cn("size-5", summary.level.color)} />
        </div>
      </div>

      {summary.progress.nextLevel ? (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {labels.proficiency.progressToNext(
                summary.progress.scoreToNext,
                summary.progress.nextLevel.label
              )}
            </span>
            <span>{summary.progress.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", summary.level.progressColor)}
              style={{ width: `${summary.progress.progress}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs font-medium text-muted-foreground">
          {labels.proficiency.maxLevel}
        </p>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground">
        {labels.proficiency.separateFromRanking}
      </p>
    </div>
  );
}

export function ProficiencyProfileSection({
  summary,
}: {
  summary: ProficiencySummary;
}) {
  return (
    <div className="surface-elevated overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold">{labels.proficiency.title}</h2>
        <p className="text-xs text-muted-foreground">{labels.proficiency.subtitle}</p>
      </div>
      <div className="p-5">
        <ProficiencyCard summary={summary} className="border-0 p-0 shadow-none hover:shadow-none" />
      </div>
    </div>
  );
}
