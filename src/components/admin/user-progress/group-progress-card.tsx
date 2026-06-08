import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";
import type { AdminGroupProgressClient } from "@/lib/admin-user-progress";
import { formatAdminDateShort } from "@/lib/format-date";
import { getStatusLabel, labels } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GroupPhaseStepper } from "@/components/admin/user-progress/group-phase-stepper";
import { GroupProgressDetail } from "@/components/admin/user-progress/group-progress-detail";
import { cn } from "@/lib/utils";

const statusVariant: Record<
  AdminGroupProgressClient["status"],
  "default" | "secondary" | "outline"
> = {
  notStarted: "outline",
  inProgress: "secondary",
  completed: "default",
};

export function GroupProgressCard({
  group,
  userId,
}: {
  group: AdminGroupProgressClient;
  userId: number;
}) {
  const lastActiveDate = group.completedAt ?? group.startedAt;
  const hasFeedback =
    group.contentHistory.length > 0 || Boolean(group.aiCompletionFeedback);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          group.status === "completed" && "bg-success",
          group.status === "inProgress" && "bg-primary",
          group.status === "notStarted" && "bg-muted-foreground/30"
        )}
      />

      <div className="space-y-3 pl-2">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold">{group.group.title}</h4>
          <Badge variant={statusVariant[group.status]} className="text-[11px]">
            {getStatusLabel(group.status)}
          </Badge>
          {group.group.isPremium && (
            <Badge
              variant="outline"
              className="gap-1 border-amber-500/40 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300"
            >
              <Crown className="size-3" />
              {labels.rewards.premiumBadge}
            </Badge>
          )}
        </div>

        <GroupPhaseStepper
          phase={group.phase}
          contentPercent={group.stepProgress.percent}
        />

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {group.pretest.total > 0 && (
            <span>
              {labels.admin.userProgress.pretestCount(
                group.pretest.answered,
                group.pretest.total
              )}
            </span>
          )}
          {group.stepProgress.total > 0 && (
            <span>
              {labels.admin.userProgress.contentSteps(
                group.stepProgress.completed,
                group.stepProgress.total
              )}
            </span>
          )}
          {group.posttest.total > 0 && (
            <span>
              {labels.admin.userProgress.posttestCount(
                group.posttest.answered,
                group.posttest.total
              )}
            </span>
          )}
          {group.groupScorePercent != null && (
            <span>{labels.admin.userProgress.groupScore(group.groupScorePercent)}</span>
          )}
          {group.testimonialRating != null && (
            <span>
              {labels.admin.userProgress.testimonialRating(group.testimonialRating)}
            </span>
          )}
          {lastActiveDate && (
            <span>
              {labels.admin.userProgress.lastActive(
                formatAdminDateShort(lastActiveDate)
              )}
            </span>
          )}
        </div>

        {group.stepProgress.total > 0 && (
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                group.status === "completed"
                  ? "bg-success"
                  : "bg-gradient-to-r from-primary to-violet-400"
              )}
              style={{ width: `${group.stepProgress.percent}%` }}
            />
          </div>
        )}

        <GroupProgressDetail group={group} />

        {hasFeedback && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-violet-500/30 text-xs text-violet-700 hover:bg-violet-500/10 dark:text-violet-300"
          >
            <Link
              href={`/admin/users/${userId}?tab=feedback&groupId=${group.group.id}`}
            >
              <Sparkles className="size-3.5" />
              {labels.admin.userProgress.tabFeedback}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
