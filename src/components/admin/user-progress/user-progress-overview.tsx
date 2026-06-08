import {
  Activity,
  BookOpen,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import type { AdminUserProgressOverviewClient } from "@/lib/admin-user-progress";
import { formatAdminDateShort } from "@/lib/format-date";
import { labels } from "@/lib/labels";
import { StatCard } from "@/components/ui/stat-card";

export function UserProgressOverview({
  overview,
}: {
  overview: AdminUserProgressOverviewClient;
}) {
  const { groupsCompleted, summary, lastActivityAt } = overview;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={labels.admin.userProgress.groupsCompleted}
        value={`${groupsCompleted.completed}/${groupsCompleted.total}`}
        icon={CheckCircle2}
        accent="primary"
      />
      <StatCard
        label={labels.admin.userProgress.materialOverall}
        value={`${summary.material.percent}%`}
        icon={BookOpen}
        accent="accent"
      />
      <StatCard
        label={labels.admin.userProgress.proficiency}
        value={summary.proficiency.level.label}
        icon={TrendingUp}
        accent="points"
      />
      <StatCard
        label={labels.admin.userProgress.lastActivity}
        value={
          lastActivityAt
            ? formatAdminDateShort(lastActivityAt)
            : labels.admin.userProgress.noActivity
        }
        icon={Activity}
        accent="accent"
      />
    </div>
  );
}
