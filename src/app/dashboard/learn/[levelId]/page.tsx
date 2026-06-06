import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { getLevelGroupsWithProgress } from "@/lib/progression";
import { getPremiumRequirementForLevel } from "@/lib/premium-access";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { getLevelLabel, getStatusLabel, labels } from "@/lib/labels";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BookOpen,
  Lock,
  Crown,
  Play,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

const statusConfig: Record<
  "notStarted" | "inProgress" | "completed",
  {
    variant: "default" | "secondary" | "outline";
    icon: typeof Circle;
    dotClass: string;
    indicatorClass: string;
  }
> = {
  notStarted: {
    variant: "outline",
    icon: Circle,
    dotClass: "bg-muted-foreground",
    indicatorClass: "from-muted-foreground/30 to-muted-foreground/10",
  },
  inProgress: {
    variant: "secondary",
    icon: Play,
    dotClass: "bg-primary",
    indicatorClass: "from-primary/30 to-primary/10",
  },
  completed: {
    variant: "default",
    icon: CheckCircle2,
    dotClass: "bg-success",
    indicatorClass: "from-success/30 to-success/10",
  },
};

export default async function LearnLevelPage({
  params,
}: {
  params: { levelId: string };
}) {
  const session = await requireStudent();
  const userId = getUserId(session);
  const levelId = parseInt(params.levelId, 10);

  const level = await prisma.level.findUnique({ where: { id: levelId } });
  if (!level) notFound();

  const groupsWithAccess = await getLevelGroupsWithProgress(userId, levelId);
  const premiumRequirement = await getPremiumRequirementForLevel(levelId);

  const completedCount = groupsWithAccess.filter(
    (g) => g.status === "completed"
  ).length;
  const totalCount = groupsWithAccess.length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header with back button and stats */}
      <PageHeader title={getLevelLabel(level.name)}>
        <div className="flex items-center gap-3">
          {totalCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm shadow-sm">
              <CheckCircle2 className="size-4 text-success" />
              <span className="font-medium">{completedCount}/{totalCount}</span>
              <span className="text-xs text-muted-foreground">groups</span>
            </div>
          )}
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Group cards */}
      <div className="flex flex-col gap-4">
        {groupsWithAccess.map(({ group, canAccess, premiumLocked, sequentialAccess, stepProgress, status, learningComplete }, index) => {
          const config = statusConfig[status];
          const StatusIcon = config.icon;

          return (
            <div
              key={group.id}
              style={{ animationDelay: `${index * 80}ms` }}
              className="group animate-slide-up relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
            >
              {/* Left accent bar based on status */}
              <div
                className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${config.indicatorClass}`}
              />

              <div className="flex flex-col gap-4 p-5 pl-6 sm:flex-row sm:items-center sm:justify-between sm:pl-7">
                {/* Left: Info */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-3">
                    {/* Status dot */}
                    <span className={`size-2 rounded-full ${config.dotClass}`} />

                    <h3 className="font-semibold leading-tight">{group.title}</h3>

                    <Badge variant={config.variant} className="gap-1.5 text-[11px]">
                      <StatusIcon className="size-3" />
                      {getStatusLabel(status)}
                    </Badge>

                    {group.isPremium && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-amber-500/40 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300"
                      >
                        <Crown className="size-3" />
                        {labels.rewards.premiumBadge}
                      </Badge>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="flex w-full max-w-xs flex-col gap-1.5">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          status === "completed"
                            ? "bg-success"
                            : "bg-gradient-to-r from-primary to-violet-400"
                        }`}
                        style={{ width: `${stepProgress.percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {labels.student.stepsProgress(stepProgress.percent)}
                    </span>
                    {learningComplete && status === "inProgress" && (
                      <span className="text-xs text-amber-700 dark:text-amber-300">
                        {labels.student.finishGroupHint}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Action */}
                {canAccess ? (
                  <Button
                    asChild
                    className={`gap-2 shrink-0 ${
                      status === "completed"
                        ? "border-success/30 bg-success/5 text-success hover:bg-success/10"
                        : ""
                    }`}
                    variant={status === "completed" ? "outline" : "default"}
                  >
                    <Link href={`/dashboard/learn/${levelId}/${group.id}`}>
                      {status === "notStarted" ? (
                        <>
                          <Play className="size-4" />
                          {labels.student.start}
                        </>
                      ) : status === "completed" ? (
                        <>
                          <BookOpen className="size-4" />
                          Review Again
                        </>
                      ) : learningComplete ? (
                        <>
                          <Play className="size-4" />
                          {labels.admin.finishGroup}
                        </>
                      ) : (
                        <>
                          <Play className="size-4" />
                          {labels.student.continue}
                        </>
                      )}
                      <ChevronRight className="size-4" />
                    </Link>
                  </Button>
                ) : premiumLocked && sequentialAccess ? (
                  <div className="flex max-w-xs flex-col gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-2.5 text-sm text-muted-foreground">
                      <Crown className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs">
                        {labels.rewards.premiumLockedHint(
                          premiumRequirement?.title ?? labels.rewards.premiumLocked
                        )}
                      </span>
                    </div>
                    <Button asChild variant="outline" size="sm" className="gap-2">
                      <Link href="/dashboard/rewards">
                        {labels.rewards.viewRequirements}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground">
                    <Lock className="size-4" />
                    <span className="text-xs">{labels.student.unlockPrevious}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {groupsWithAccess.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title={labels.student.noPublishedGroups}
          />
        )}
      </div>
    </div>
  );
}
