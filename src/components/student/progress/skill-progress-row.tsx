import { QuestionSkill } from "@prisma/client";
import { BookOpen, Headphones, Mic, Pencil } from "lucide-react";
import type { SkillProgressStat } from "@/lib/skill-progress";
import { labels } from "@/lib/labels";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const SKILL_THEME: Record<
  QuestionSkill,
  { icon: typeof Mic; indicator: string; iconWrap: string }
> = {
  [QuestionSkill.SPEAKING]: {
    icon: Mic,
    indicator: "bg-violet-500",
    iconWrap: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  [QuestionSkill.READING]: {
    icon: BookOpen,
    indicator: "bg-emerald-500",
    iconWrap: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  [QuestionSkill.WRITING]: {
    icon: Pencil,
    indicator: "bg-sky-500",
    iconWrap: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  [QuestionSkill.LISTENING]: {
    icon: Headphones,
    indicator: "bg-amber-500",
    iconWrap: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

export function SkillProgressRow({
  stat,
  compact = false,
}: {
  stat: SkillProgressStat;
  compact?: boolean;
}) {
  const theme = SKILL_THEME[stat.skill];
  const Icon = theme.icon;

  const caption =
    stat.attempted === 0
      ? labels.progress.skillNotStarted
      : stat.accuracyPercent != null
        ? labels.progress.skillDone(
            stat.attempted,
            stat.total,
            stat.accuracyPercent
          )
        : labels.progress.skillAttempted(stat.attempted, stat.total);

  if (compact) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/15 px-2.5 py-2">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md",
                theme.iconWrap
              )}
            >
              <Icon className="size-3" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{stat.label}</p>
              <p className="truncate text-[10px] text-muted-foreground">{caption}</p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-bold tabular-nums">
            {stat.completionPercent}%
          </span>
        </div>
        <Progress
          value={stat.completionPercent}
          className="h-1 bg-muted"
          indicatorClassName={cn(theme.indicator, "transition-all duration-700")}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              theme.iconWrap
            )}
          >
            <Icon className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{caption}</p>
          </div>
        </div>
        <span className="text-sm font-bold tabular-nums text-foreground">
          {stat.completionPercent}%
        </span>
      </div>

      <Progress
        value={stat.completionPercent}
        className="h-1.5 bg-muted"
        indicatorClassName={cn(theme.indicator, "transition-all duration-700")}
      />
    </div>
  );
}
