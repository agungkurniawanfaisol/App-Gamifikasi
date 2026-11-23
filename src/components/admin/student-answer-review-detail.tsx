import type { AdminUserProgressOverviewClient } from "@/lib/admin-user-progress";
import { aggregateContentAnswerStatsFromOverview } from "@/lib/admin-student-answer-review";
import { PrintReportToolbar } from "@/components/admin/print-report-toolbar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getLevelLabel, labels } from "@/lib/labels";
import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";

export function StudentAnswerReviewDetail({
  studentName,
  studentEmail,
  overview,
}: {
  studentName: string;
  studentEmail: string;
  overview: AdminUserProgressOverviewClient;
}) {
  const summary = aggregateContentAnswerStatsFromOverview(overview.levels);

  return (
    <div className="space-y-6">
      <PrintReportToolbar />

      <div id="student-answer-review-print" className="space-y-6">
        <div className="space-y-1 border-l-[3px] border-primary pl-4">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {labels.admin.analyticsReviewDetailTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            {labels.admin.analyticsReviewDetailDescription(studentName)}
          </p>
          <p className="text-sm text-muted-foreground">{studentEmail}</p>
        </div>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {labels.admin.analyticsReviewSummary}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label={labels.admin.analyticsCorrect}
              value={summary.correct}
              icon={CheckCircle2}
              accent="primary"
            />
            <StatCard
              label={labels.admin.analyticsIncorrect}
              value={summary.incorrect}
              icon={XCircle}
              accent="accent"
            />
            <StatCard
              label={labels.admin.analyticsUnanswered}
              value={summary.unanswered}
              icon={CircleHelp}
              accent="points"
            />
            <StatCard
              label={labels.admin.analyticsTotalSlots}
              value={summary.totalSlots}
              icon={CheckCircle2}
              accent="primary"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {labels.admin.analyticsReviewByGroup}
          </h3>
          <div className="space-y-4">
            {overview.levels.map((level) => {
              if (level.groups.length === 0) return null;
              return (
                <Card key={level.levelId}>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base">
                      {getLevelLabel(level.levelName)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
                    {level.groups.map((group) => (
                      <div
                        key={group.group.id}
                        className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {group.group.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {labels.admin.userProgress.contentAnswerStats(
                              group.contentAnswers.correct,
                              group.contentAnswers.incorrect,
                              group.contentAnswers.unanswered
                            )}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="default">
                            {labels.admin.analyticsCorrect}:{" "}
                            {group.contentAnswers.correct}
                          </Badge>
                          <Badge variant="secondary">
                            {labels.admin.analyticsIncorrect}:{" "}
                            {group.contentAnswers.incorrect}
                          </Badge>
                          <Badge variant="outline">
                            {labels.admin.analyticsUnanswered}:{" "}
                            {group.contentAnswers.unanswered}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
