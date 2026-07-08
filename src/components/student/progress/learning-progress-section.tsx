import { TrendingUp } from "lucide-react";
import type { LearningProgressSummary } from "@/lib/skill-progress";
import { SkillProgressRow } from "@/components/student/progress/skill-progress-row";
import { labels } from "@/lib/labels";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function LearningProgressSection({
  summary,
  hideProficiency = false,
  hideHeader = false,
  className,
}: {
  summary: LearningProgressSummary;
  hideProficiency?: boolean;
  hideHeader?: boolean;
  className?: string;
}) {
  const { material, proficiency, skills } = summary;
  const LevelIcon = proficiency.level.icon;

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6",
        className
      )}
    >
      {hideHeader ? null : (
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <TrendingUp className="size-5 text-primary" />
          {labels.progress.sectionTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {labels.progress.sectionSubtitle}
        </p>
      </div>
      )}

      <div
        className={cn(
          "grid gap-5",
          hideProficiency ? "grid-cols-1" : "lg:grid-cols-2"
        )}
      >
        <div className="space-y-3 rounded-xl border border-border/70 bg-muted/15 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {labels.progress.materialTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {labels.progress.materialHint(material.completed, material.total)}
              </p>
            </div>
            <span className="text-lg font-bold tabular-nums">
              {material.percent}%
            </span>
          </div>
          <Progress
            value={material.percent}
            className="h-2.5 bg-muted"
            indicatorClassName="bg-gradient-to-r from-emerald-500 to-primary transition-all duration-700"
          />
        </div>

        {!hideProficiency ? (
        <div className="space-y-3 rounded-xl border border-border/70 bg-muted/15 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {labels.progress.levelTitle}
              </p>
              <p className={cn("mt-1 text-sm font-semibold", proficiency.level.color)}>
                {proficiency.level.label}
              </p>
              {proficiency.progress.nextLevel ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {labels.proficiency.progressToNext(
                    proficiency.progress.scoreToNext,
                    proficiency.progress.nextLevel.label
                  )}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  {labels.proficiency.maxLevel}
                </p>
              )}
            </div>
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                proficiency.level.badgeBg
              )}
            >
              <LevelIcon className={cn("size-5", proficiency.level.color)} />
            </div>
          </div>
          <Progress
            value={proficiency.progress.progress}
            className="h-2.5 bg-muted"
            indicatorClassName={cn(
              proficiency.level.progressColor,
              "transition-all duration-700"
            )}
          />
        </div>
        ) : null}
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {labels.progress.skillsTitle}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {skills.map((stat) => (
            <SkillProgressRow key={stat.skill} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
