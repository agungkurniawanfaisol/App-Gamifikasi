import type {
  AdminGroupProgressClient,
  AdminLevelProgressClient,
  AdminUserProgressOverviewClient,
} from "@/lib/admin-user-progress";
import { aggregateContentAnswerStatsFromOverview } from "@/lib/admin-student-answer-review";
import { formatAdminDateShort, formatAdminDateTime } from "@/lib/format-date";
import { PrintReportToolbar } from "@/components/admin/print-report-toolbar";
import { Badge } from "@/components/ui/badge";
import { getLevelLabel, getStatusLabel, labels } from "@/lib/labels";

function groupHasActivity(group: AdminGroupProgressClient): boolean {
  if (group.status !== "notStarted") return true;
  const answered =
    group.contentAnswers.correct + group.contentAnswers.incorrect;
  return (
    answered > 0 ||
    group.contentHistory.length > 0 ||
    group.pretest.answered > 0 ||
    group.posttest.answered > 0 ||
    group.stepProgress.completed > 0 ||
    Boolean(group.aiCompletionFeedback?.trim()) ||
    Boolean(group.testimonialText?.trim()) ||
    group.testimonialRating != null ||
    group.groupScorePercent != null
  );
}

function levelsWithActivity(levels: AdminLevelProgressClient[]): Array<{
  levelId: number;
  levelName: string;
  completed: number;
  total: number;
  groups: AdminGroupProgressClient[];
}> {
  return levels
    .map((level) => ({
      levelId: level.levelId,
      levelName: level.levelName,
      completed: level.completed,
      total: level.total,
      groups: level.groups.filter(groupHasActivity),
    }))
    .filter((level) => level.groups.length > 0);
}

export function StudentAnswerReviewDetail({
  studentName,
  studentEmail,
  institution,
  studentId,
  overview,
  generatedAt,
}: {
  studentName: string;
  studentEmail: string;
  institution?: string | null;
  studentId?: string | null;
  overview: AdminUserProgressOverviewClient;
  generatedAt: string;
}) {
  const summary = aggregateContentAnswerStatsFromOverview(overview.levels);
  const levels = levelsWithActivity(overview.levels);
  const generatedLabel = formatAdminDateTime(generatedAt);
  const pdfSlug =
    studentName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "student";

  return (
    <div className="space-y-6">
      <PrintReportToolbar pdfFileName={`student-answer-report-${pdfSlug}.pdf`} />

      <article
        id="student-answer-review-print"
        className="admin-print-root official-report space-y-8 rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8 print:rounded-none print:border-0 print:bg-white print:p-0"
      >
        <header className="space-y-3 border-b border-border pb-6 text-center print:border-black">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground print:text-black">
            {labels.nav.partnerBrand}
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {labels.nav.brand}
          </h1>
          <h2 className="text-lg font-semibold sm:text-xl">
            {labels.admin.analyticsReportOfficialTitle}
          </h2>
          <p className="text-sm text-muted-foreground print:text-neutral-700">
            {labels.admin.analyticsReportSubtitle}
          </p>
          <p className="text-sm text-muted-foreground print:text-neutral-700">
            {labels.admin.analyticsReportGeneratedOn(generatedLabel)}
          </p>
        </header>

        <section className="space-y-3 break-inside-avoid">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground print:text-black">
            {labels.admin.analyticsReportStudentInfo}
          </h3>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr className="border-b border-border print:border-neutral-400">
                <th className="w-44 py-2 pr-4 text-left font-medium text-muted-foreground print:text-black">
                  {labels.admin.analyticsReportFieldName}
                </th>
                <td className="py-2 font-medium">{studentName}</td>
              </tr>
              <tr className="border-b border-border print:border-neutral-400">
                <th className="py-2 pr-4 text-left font-medium text-muted-foreground print:text-black">
                  {labels.admin.analyticsReportFieldEmail}
                </th>
                <td className="py-2">{studentEmail}</td>
              </tr>
              {institution ? (
                <tr className="border-b border-border print:border-neutral-400">
                  <th className="py-2 pr-4 text-left font-medium text-muted-foreground print:text-black">
                    {labels.admin.analyticsReportFieldInstitution}
                  </th>
                  <td className="py-2">{institution}</td>
                </tr>
              ) : null}
              {studentId ? (
                <tr className="border-b border-border print:border-neutral-400">
                  <th className="py-2 pr-4 text-left font-medium text-muted-foreground print:text-black">
                    {labels.admin.analyticsReportFieldStudentId}
                  </th>
                  <td className="py-2">{studentId}</td>
                </tr>
              ) : null}
              <tr className="border-b border-border print:border-neutral-400">
                <th className="py-2 pr-4 text-left font-medium text-muted-foreground print:text-black">
                  {labels.admin.analyticsReportFieldLevels}
                </th>
                <td className="py-2">
                  <div className="flex flex-wrap gap-2 pt-1">
                    {overview.levels.map((lvl) => {
                      const levelName = getLevelLabel(lvl.levelName);
                      const answeredInLevel = lvl.groups.reduce(
                        (sum, g) =>
                          sum +
                          g.contentAnswers.correct +
                          g.contentAnswers.incorrect,
                        0
                      );
                      const hasActivity =
                        lvl.completed > 0 ||
                        answeredInLevel > 0 ||
                        lvl.groups.some(groupHasActivity);
                      const isCompleted =
                        lvl.total > 0 && lvl.completed >= lvl.total;

                      const statusLabel = isCompleted
                        ? labels.status.completed
                        : hasActivity
                          ? labels.status.inProgress
                          : labels.status.notStarted;

                      const badgeVariant = isCompleted
                        ? ("default" as const)
                        : hasActivity
                          ? ("secondary" as const)
                          : ("outline" as const);

                      return (
                        <div
                          key={lvl.levelId}
                          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs print:border-neutral-400"
                        >
                          <span className="font-semibold text-foreground print:text-black">
                            {levelName}:
                          </span>
                          <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
                            {statusLabel}
                          </Badge>
                          {hasActivity ? (
                            <span className="text-muted-foreground print:text-neutral-700">
                              ({lvl.completed}/{lvl.total} {labels.student.levelGroupsLabel}
                              {answeredInLevel > 0 ? ` · ${answeredInLevel} ans` : ""}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="space-y-3 break-inside-avoid">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground print:text-black">
            {labels.admin.analyticsReviewSummary}
          </h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-border print:border-black">
                <th className="py-2 pr-4 text-left font-semibold">
                  {labels.admin.analyticsReportMetric}
                </th>
                <th className="py-2 text-right font-semibold">
                  {labels.admin.analyticsReportCount}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border print:border-neutral-400">
                <td className="py-2">{labels.admin.analyticsCorrect}</td>
                <td className="py-2 text-right font-medium tabular-nums">
                  {summary.correct}
                </td>
              </tr>
              <tr className="border-b border-border print:border-neutral-400">
                <td className="py-2">{labels.admin.analyticsIncorrect}</td>
                <td className="py-2 text-right font-medium tabular-nums">
                  {summary.incorrect}
                </td>
              </tr>
              <tr className="border-b border-border print:border-neutral-400">
                <td className="py-2">{labels.admin.analyticsUnanswered}</td>
                <td className="py-2 text-right font-medium tabular-nums">
                  {summary.unanswered}
                </td>
              </tr>
              <tr className="border-b border-border print:border-neutral-400">
                <td className="py-2">{labels.admin.analyticsTotalSlots}</td>
                <td className="py-2 text-right font-medium tabular-nums">
                  {summary.totalSlots}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground print:text-black">
            {labels.admin.analyticsReportByLevel}
          </h3>

          {levels.length === 0 ? (
            <p className="text-sm text-muted-foreground print:text-neutral-700">
              {labels.admin.analyticsReportNoActivity}
            </p>
          ) : (
            levels.map((level) => (
              <div
                key={level.levelId}
                className="space-y-4 break-inside-avoid rounded-xl border border-border p-4 sm:p-5 print:border print:border-neutral-500"
              >
                <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between print:border-black">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold tracking-tight">
                      {getLevelLabel(level.levelName)}
                    </h4>
                    <Badge
                      variant={
                        level.completed >= level.total && level.total > 0
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {level.completed >= level.total && level.total > 0
                        ? labels.status.completed
                        : labels.status.inProgress}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground print:text-neutral-700">
                    {labels.admin.userProgress.groupsInLevel(
                      level.completed,
                      level.total
                    )}
                  </p>
                </div>

                {level.groups.map((group) => (
                  <div
                    key={group.group.id}
                    className="space-y-4 break-inside-avoid rounded-lg border border-border/70 p-3 sm:p-4 print:border print:border-neutral-400 print:p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold">{group.group.title}</p>
                        <p className="text-sm text-muted-foreground print:text-neutral-700">
                          {getStatusLabel(group.status)}
                          {group.groupScorePercent != null
                            ? ` · ${labels.admin.analyticsReportGroupScore(
                                group.groupScorePercent
                              )}`
                            : ""}
                        </p>
                        <p className="text-sm text-muted-foreground print:text-neutral-700">
                          {labels.admin.userProgress.contentAnswerStats(
                            group.contentAnswers.correct,
                            group.contentAnswers.incorrect,
                            group.contentAnswers.unanswered
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 print:gap-1">
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

                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-black">
                        {labels.admin.analyticsReportQuestionDetail}
                      </h5>
                      {group.contentHistory.length === 0 ? (
                        <p className="text-sm text-muted-foreground print:text-neutral-700">
                          {labels.admin.analyticsReportNoQuestions}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[36rem] border-collapse text-sm">
                              <thead>
                                <tr className="border-b-2 border-border print:border-black">
                                  <th className="py-2 pr-3 text-left font-semibold">
                                    {labels.admin.analyticsReportColQuestion}
                                  </th>
                                  <th className="py-2 pr-3 text-left font-semibold">
                                    {labels.admin.analyticsReportColResult}
                                  </th>
                                  <th className="py-2 pr-3 text-right font-semibold">
                                    {labels.admin.analyticsReportColScore}
                                  </th>
                                  <th className="py-2 text-left font-semibold">
                                    {
                                      labels.admin
                                        .analyticsReportColAnsweredAt
                                    }
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.contentHistory.map((entry) => (
                                  <tr
                                    key={`${entry.contentItemId}-${entry.subQuestionIndex}-${entry.createdAt}`}
                                    className="border-b border-border/70 align-top print:border-neutral-300"
                                  >
                                    <td className="max-w-[18rem] py-2 pr-3">
                                      <span className="line-clamp-3 print:line-clamp-none">
                                        {entry.itemLabel}
                                      </span>
                                    </td>
                                    <td className="py-2 pr-3">
                                      {entry.isCorrect
                                        ? labels.admin.userProgress
                                            .answerCorrect
                                        : labels.admin.userProgress
                                            .answerIncorrect}
                                    </td>
                                    <td className="py-2 pr-3 text-right tabular-nums">
                                      {entry.scorePercent != null
                                        ? labels.admin.userProgress.answerScore(
                                            entry.scorePercent
                                          )
                                        : labels.admin.userProgress.noAnswer}
                                    </td>
                                    <td className="py-2 whitespace-nowrap text-muted-foreground print:text-neutral-700">
                                      {formatAdminDateShort(entry.createdAt)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {group.contentHistory.some((entry) =>
                            Boolean(entry.aiFeedback?.trim())
                          ) ? (
                            <div className="space-y-3">
                              <h6 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-black">
                                {labels.admin.analyticsReportAiReview}
                              </h6>
                              {group.contentHistory
                                .filter((entry) =>
                                  Boolean(entry.aiFeedback?.trim())
                                )
                                .map((entry) => (
                                  <div
                                    key={`ai-${entry.contentItemId}-${entry.subQuestionIndex}-${entry.createdAt}`}
                                    className="rounded-md border border-border/60 bg-muted/30 p-3 print:border-neutral-400 print:bg-white"
                                  >
                                    <p className="mb-1 text-sm font-medium">
                                      {entry.itemLabel}
                                    </p>
                                    <p className="whitespace-pre-wrap text-sm text-muted-foreground print:text-neutral-800">
                                      {entry.aiFeedback}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {group.aiCompletionFeedback?.trim() ? (
                      <div className="space-y-2 break-inside-avoid rounded-md border border-border/60 p-3 print:border-neutral-400">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-black">
                          {labels.admin.analyticsReportCompletionReview}
                        </h5>
                        <p className="whitespace-pre-wrap text-sm print:text-neutral-800">
                          {group.aiCompletionFeedback}
                        </p>
                      </div>
                    ) : null}

                    {group.testimonialText?.trim() ||
                    group.testimonialRating != null ? (
                      <div className="space-y-2 break-inside-avoid rounded-md border border-border/60 p-3 print:border-neutral-400">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-black">
                          {labels.admin.analyticsReportTestimonial}
                        </h5>
                        {group.testimonialRating != null ? (
                          <p className="text-sm font-medium">
                            {labels.admin.userProgress.testimonialRating(
                              group.testimonialRating
                            )}
                          </p>
                        ) : null}
                        {group.testimonialText?.trim() ? (
                          <p className="whitespace-pre-wrap text-sm italic print:text-neutral-800">
                            &ldquo;{group.testimonialText.trim()}&rdquo;
                          </p>
                        ) : null}
                        {group.testimonialSubmittedAt ? (
                          <p className="text-xs text-muted-foreground print:text-neutral-700">
                            {formatAdminDateShort(group.testimonialSubmittedAt)}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ))
          )}
        </section>

        <footer className="space-y-8 border-t border-border pt-6 print:border-black">
          <p className="text-xs text-muted-foreground print:text-neutral-700">
            {labels.admin.analyticsReportFooterNote}
          </p>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-8">
              <p className="text-sm font-medium">
                {labels.admin.analyticsReportPreparedBy}
              </p>
              <div className="border-b border-border pt-10 print:border-black" />
            </div>
            <div className="space-y-8">
              <p className="text-sm font-medium">
                {labels.admin.analyticsReportSignatureDate}
              </p>
              <div className="border-b border-border pt-10 print:border-black" />
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
