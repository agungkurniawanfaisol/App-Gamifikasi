import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { getBatchLevelProgressSummaries } from "@/lib/progression";
import { PageHeader } from "@/components/ui/page-header";
import { getLevelLabel, labels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Trophy,
} from "lucide-react";

const levelTheme: Record<
  string,
  { gradient: string; icon: typeof BookOpen; accent: string; emoji: string }
> = {
  BASIC: {
    gradient: "from-emerald-500/10 to-emerald-500/5",
    icon: BookOpen,
    accent: "text-emerald-600 dark:text-emerald-400",
    emoji: "🌱",
  },
  INTERMEDIATE: {
    gradient: "from-violet-500/10 to-violet-500/5",
    icon: GraduationCap,
    accent: "text-violet-600 dark:text-violet-400",
    emoji: "🚀",
  },
  HARD: {
    gradient: "from-amber-500/10 to-rose-500/5",
    icon: Trophy,
    accent: "text-amber-600 dark:text-amber-400",
    emoji: "🔥",
  },
};

export default async function LearnIndexPage() {
  const session = await requireStudent();
  const userId = getUserId(session);

  const levels = await prisma.level.findMany({ orderBy: { order: "asc" } });
  const progressByLevel = await getBatchLevelProgressSummaries(
    userId,
    levels.map((level) => level.id)
  );
  const summaries = levels.map((level) => ({
    level,
    progress: progressByLevel.get(level.id) ?? { completed: 0, total: 0 },
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader title={labels.nav.learn}>
        <p className="text-sm text-muted-foreground">{labels.student.chooseLevel}</p>
      </PageHeader>

      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map(({ level, progress }, index) => {
          const percent =
            progress.total > 0
              ? Math.round((progress.completed / progress.total) * 100)
              : 0;

          const theme = levelTheme[level.name] ?? levelTheme.BASIC;
          const Icon = theme.icon;

          return (
            <Link
              key={level.id}
              href={`/dashboard/learn/${level.id}`}
              style={{ animationDelay: `${index * 100}ms` }}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md active:translate-y-0",
                percent >= 100 ? "animate-fade-in" : "hover:-translate-y-0.5"
              )}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-60`}
              />

              <span
                className="pointer-events-none absolute -bottom-3 -right-3 select-none text-6xl opacity-[0.06] transition-opacity group-hover:opacity-[0.10]"
                aria-hidden="true"
              >
                {theme.emoji}
              </span>

              <div
                className={`relative h-1.5 w-full bg-gradient-to-r ${theme.gradient} opacity-80`}
              />

              <div className="relative flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} ${theme.accent} shadow-sm`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        percent >= 100
                          ? "bg-success"
                          : percent > 0
                            ? "bg-primary"
                            : "bg-muted-foreground"
                      )}
                    />
                    {percent}%
                  </span>
                </div>

                <h2 className="text-lg font-bold tracking-tight">
                  {getLevelLabel(level.name)}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {labels.student.groupsCompleted(progress.completed, progress.total)}
                </p>

                <div className="flex-1" />

                <div className="mb-4 mt-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-700 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-primary transition-all group-hover:gap-3">
                  {percent >= 100
                    ? labels.student.homeReview
                    : percent > 0
                      ? labels.student.continueLearning
                      : labels.student.startLearning}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
