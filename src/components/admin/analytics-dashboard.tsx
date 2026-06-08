import { Activity, BarChart3, Layers, Target, Users } from "lucide-react";
import type { AdminAnalyticsSnapshot } from "@/lib/admin-analytics";
import { getSkillLabel } from "@/lib/content-item";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveTable,
  ResponsiveTableCard,
} from "@/components/ui/responsive-table";
import { StatCard } from "@/components/ui/stat-card";
import { labels } from "@/lib/labels";

function TableSection({
  title,
  isEmpty,
  children,
}: {
  title: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        {isEmpty ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard({
  data,
}: {
  data: AdminAnalyticsSnapshot;
}) {
  const { activity } = data;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {labels.admin.analyticsActivity}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={labels.admin.analyticsActive7}
            value={activity.activeLast7Days}
            icon={Activity}
            accent="primary"
          />
          <StatCard
            label={labels.admin.analyticsActive30}
            value={activity.activeLast30Days}
            icon={Users}
            accent="accent"
          />
          <StatCard
            label={labels.admin.analyticsInactive}
            value={activity.inactiveCount}
            icon={BarChart3}
            accent="points"
          />
          <StatCard
            label={labels.admin.totalStudents}
            value={activity.totalStudents}
            icon={Layers}
            accent="primary"
          />
        </div>
      </section>

      <TableSection
        title={labels.admin.analyticsLevelCompletion}
        isEmpty={data.levelCompletion.length === 0}
      >
        <ResponsiveTable
          mobile={data.levelCompletion.map((row) => (
            <ResponsiveTableCard key={row.levelId}>
              <p className="font-semibold">{row.levelName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {labels.admin.groupsPublished(
                  row.totalGroups,
                  row.publishedGroups
                )}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm">{labels.admin.analyticsCompletionRate}</span>
                <Badge>{`${row.completionRate}%`}</Badge>
              </div>
            </ResponsiveTableCard>
          ))}
          desktop={
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">Level</th>
                    <th className="px-4 py-3 text-start font-medium">Groups</th>
                    <th className="px-4 py-3 text-end font-medium">
                      {labels.admin.analyticsCompletionRate}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.levelCompletion.map((row) => (
                    <tr key={row.levelId}>
                      <td className="px-4 py-3 font-medium">{row.levelName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {labels.admin.groupsPublished(
                          row.totalGroups,
                          row.publishedGroups
                        )}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Badge variant="secondary">{`${row.completionRate}%`}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
      </TableSection>

      <TableSection
        title={labels.admin.analyticsGroupCompletion}
        isEmpty={data.groupCompletion.length === 0}
      >
        <ResponsiveTable
          mobile={data.groupCompletion.map((row) => (
            <ResponsiveTableCard key={row.groupId}>
              <p className="font-semibold">{row.groupTitle}</p>
              <p className="text-xs text-muted-foreground">{row.levelName}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Started</span>
                  <p className="font-medium">{row.startedCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Completed</span>
                  <p className="font-medium">{row.completedCount}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm">{labels.admin.analyticsCompletionRate}</span>
                <Badge>{`${row.completionRate}%`}</Badge>
              </div>
            </ResponsiveTableCard>
          ))}
          desktop={
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">Group</th>
                    <th className="px-4 py-3 text-start font-medium">Level</th>
                    <th className="px-4 py-3 text-end font-medium">Started</th>
                    <th className="px-4 py-3 text-end font-medium">Completed</th>
                    <th className="px-4 py-3 text-end font-medium">
                      {labels.admin.analyticsCompletionRate}
                    </th>
                    <th className="px-4 py-3 text-end font-medium">Avg score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.groupCompletion.map((row) => (
                    <tr key={row.groupId}>
                      <td className="px-4 py-3 font-medium">{row.groupTitle}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.levelName}
                      </td>
                      <td className="px-4 py-3 text-end">{row.startedCount}</td>
                      <td className="px-4 py-3 text-end">{row.completedCount}</td>
                      <td className="px-4 py-3 text-end">
                        <Badge variant="secondary">{`${row.completionRate}%`}</Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
                        {row.avgScore != null ? `${row.avgScore}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
      </TableSection>

      <TableSection
        title={labels.admin.analyticsQuestionDifficulty}
        isEmpty={data.questionDifficulty.length === 0}
      >
        <ResponsiveTable
          mobile={data.questionDifficulty.map((row) => (
            <ResponsiveTableCard key={row.contentItemId}>
              <p className="line-clamp-2 font-medium">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.groupTitle}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {row.skill && (
                  <Badge variant="outline">{getSkillLabel(row.skill)}</Badge>
                )}
                <span className="text-muted-foreground">
                  {labels.admin.analyticsAttempts}: {row.attempts}
                </span>
                <Badge variant="destructive">{`${row.successRate}%`}</Badge>
              </div>
            </ResponsiveTableCard>
          ))}
          desktop={
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">Question</th>
                    <th className="px-4 py-3 text-start font-medium">Group</th>
                    <th className="px-4 py-3 text-start font-medium">Skill</th>
                    <th className="px-4 py-3 text-end font-medium">
                      {labels.admin.analyticsAttempts}
                    </th>
                    <th className="px-4 py-3 text-end font-medium">
                      {labels.admin.analyticsSuccessRate}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.questionDifficulty.map((row) => (
                    <tr key={row.contentItemId}>
                      <td className="max-w-xs truncate px-4 py-3 font-medium">
                        {row.label}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.groupTitle}
                      </td>
                      <td className="px-4 py-3">
                        {row.skill ? getSkillLabel(row.skill) : "—"}
                      </td>
                      <td className="px-4 py-3 text-end">{row.attempts}</td>
                      <td className="px-4 py-3 text-end">
                        <Badge
                          variant={
                            row.successRate < 50 ? "destructive" : "secondary"
                          }
                        >
                          {`${row.successRate}%`}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
      </TableSection>

      <TableSection
        title={labels.admin.analyticsSkillHeatmap}
        isEmpty={data.skillHeatmap.every((s) => s.attempts === 0)}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.skillHeatmap.map((row) => (
            <div
              key={row.skill}
              className="rounded-lg border border-border bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{getSkillLabel(row.skill)}</p>
                <Target className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{`${row.successRate}%`}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {labels.admin.analyticsAttempts}: {row.attempts}
              </p>
            </div>
          ))}
        </div>
      </TableSection>

      <TableSection
        title={labels.admin.analyticsDropOff}
        isEmpty={data.dropOff.length === 0}
      >
        <ResponsiveTable
            mobile={data.dropOff.map((row) => (
              <ResponsiveTableCard key={row.groupId}>
                <p className="font-semibold">{row.groupTitle}</p>
                <p className="text-xs text-muted-foreground">{row.levelName}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm">
                    {labels.admin.analyticsStuckStudents}
                  </span>
                  <Badge variant="destructive">{row.stuckCount}</Badge>
                </div>
              </ResponsiveTableCard>
            ))}
            desktop={
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-start font-medium">Group</th>
                      <th className="px-4 py-3 text-start font-medium">Level</th>
                      <th className="px-4 py-3 text-end font-medium">Items</th>
                      <th className="px-4 py-3 text-end font-medium">
                        {labels.admin.analyticsStuckStudents}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.dropOff.map((row) => (
                      <tr key={row.groupId}>
                        <td className="px-4 py-3 font-medium">{row.groupTitle}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.levelName}
                        </td>
                        <td className="px-4 py-3 text-end">{row.totalItems}</td>
                        <td className="px-4 py-3 text-end">
                          <Badge variant="destructive">{row.stuckCount}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          />
      </TableSection>
    </div>
  );
}
