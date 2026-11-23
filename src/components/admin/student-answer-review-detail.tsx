import type {
  AdminGroupProgressClient,
  AdminLevelProgressClient,
  AdminUserProgressOverviewClient,
} from "@/lib/admin-user-progress";
import { aggregateContentAnswerStatsFromOverview } from "@/lib/admin-student-answer-review";
import { formatAdminDateShort, formatAdminDateTime } from "@/lib/format-date";
import { PrintReportToolbar } from "@/components/admin/print-report-toolbar";
import { Badge } from "@/components/ui/badge";
import { getLevelLabel, labels } from "@/lib/labels";

function groupHasActivity(group: AdminGroupProgressClient): boolean {
  if (group.status !== "notStarted") return true;
  const answered =
    group.contentAnswers.correct + group.contentAnswers.incorrect;
  return answered > 0 || group.contentHistory.length > 0;
}

function activeLevels(
  levels: AdminLevelProgressClient[]
): Array<{
  levelId: number;
  levelName: string;
  groups: AdminGroupProgressClient[];
}> {
  return levels
    .map((level) => ({
      levelId: level.levelId,
      levelName: level.levelName,
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
  const levels = activeLevels(overview.levels);
  const generatedLabel = formatAdminDateTime(generatedAt);

  return (
    <div className="space-y-6">
      <PrintReportToolbar />

      <article
        id="student-answer-review-print"
        className="official-report space-y-8 rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8 print:rounded-none print:border-0 print:bg-white print:p-0"
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
                <th className="w-40 py-2 pr-4 text-left font-medium text-muted-foreground print:text-black">
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

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground print:text-black">
            {labels.admin.analyticsReviewByGroup}
          </h3>

          {levels.length === 0 ? (
            <p className="text-sm text-muted-foreground print:text-neutral-700">
              {labels.admin.analyticsReportNoActivity}
            </p>
          ) : (
            levels.map((level) => (
              <div key={level.levelId} className="space-y-4">
                <h4 className="border-b border-border pb-2 text-base font-semibold print:border-black">
                  {getLevelLabel(level.levelName)}
                </h4>

                {level.groups.map((group) => (
                  <div
                    key={group.group.id}
                    className="space-y-3 break-inside-avoid rounded-lg border border-border/70 p-3 sm:p-4 print:border print:border-neutral-400 print:p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium">{group.group.title}</p>
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
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[32rem] border-collapse text-sm">
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
                                  {labels.admin.analyticsReportColAnsweredAt}
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
                                      ? labels.admin.userProgress.answerCorrect
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
                      )}
                    </div>
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
