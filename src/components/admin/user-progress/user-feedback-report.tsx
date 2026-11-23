import {
  BookOpen,
  CheckCircle2,
  MapPin,
  Percent,
  XCircle,
} from "lucide-react";
import type { AdminUserProgressOverviewClient } from "@/lib/admin-user-progress";
import { summarizeAnswerReport } from "@/lib/admin-user-progress";
import type { LearningPhase } from "@/lib/learning-phase";
import { getLevelLabel, labels } from "@/lib/labels";
import { StatCard } from "@/components/ui/stat-card";

function phaseLabel(phase: LearningPhase): string {
  switch (phase) {
    case "pretest":
      return labels.admin.userProgress.phasePretest;
    case "content":
      return labels.admin.userProgress.phaseContent;
    case "posttest":
      return labels.admin.userProgress.phasePosttest;
    case "finished":
      return labels.admin.userProgress.phaseFinished;
  }
}

function formatProgressDetail(
  report: ReturnType<typeof summarizeAnswerReport>
): string {
  if (report.progressLabel === "notStarted") {
    return labels.admin.userProgress.reportNotStarted;
  }
  if (report.progressLabel === "completed") {
    return labels.admin.userProgress.reportAllCompleted;
  }
  const position = report.currentPosition;
  if (!position) {
    return labels.admin.userProgress.reportNotStarted;
  }
  return labels.admin.userProgress.reportCurrentPosition(
    getLevelLabel(position.levelName),
    position.groupTitle,
    position.stepProgress.completed,
    position.stepProgress.total,
    phaseLabel(position.phase)
  );
}

export function UserFeedbackReport({
  overview,
}: {
  overview: AdminUserProgressOverviewClient;
}) {
  const report = summarizeAnswerReport(overview);
  const { answers, accuracyPercent, groupsCompleted } = report;

  return (
    <section className="space-y-3" aria-labelledby="feedback-report-title">
      <h2
        id="feedback-report-title"
        className="text-sm font-semibold tracking-tight text-foreground"
      >
        {labels.admin.userProgress.reportTitle}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={labels.admin.userProgress.reportCorrect}
          value={answers.correct}
          icon={CheckCircle2}
          accent="primary"
        />
        <StatCard
          label={labels.admin.userProgress.reportIncorrect}
          value={answers.incorrect}
          icon={XCircle}
          accent="accent"
        />
        <StatCard
          label={labels.admin.userProgress.reportUnanswered}
          value={answers.unanswered}
          icon={BookOpen}
          accent="accent"
        />
        <StatCard
          label={labels.admin.userProgress.reportAccuracy}
          value={
            accuracyPercent != null
              ? labels.admin.userProgress.reportAccuracyValue(accuracyPercent)
              : labels.admin.userProgress.noAnswer
          }
          icon={Percent}
          accent="points"
        />
      </div>

      <div className="surface-card flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <MapPin className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {labels.admin.userProgress.reportProgress}
          </p>
          <p className="text-lg font-semibold tracking-tight">
            {labels.admin.userProgress.reportGroupsProgress(
              groupsCompleted.completed,
              groupsCompleted.total
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatProgressDetail(report)}
          </p>
        </div>
      </div>
    </section>
  );
}
