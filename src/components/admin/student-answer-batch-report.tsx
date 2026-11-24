import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { StudentAnswerReviewRow } from "@/lib/admin-student-answer-review";
import { formatAdminDateTime } from "@/lib/format-date";
import { PrintReportToolbar } from "@/components/admin/print-report-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";

function getStudentStatus(row: StudentAnswerReviewRow) {
  const answered = row.correct + row.incorrect;
  if (row.unanswered === 0 && row.totalSlots > 0) {
    return {
      label: labels.admin.analyticsReportStatusCompleted,
      variant: "default" as const,
    };
  }
  if (answered > 0) {
    return {
      label: labels.admin.analyticsReportStatusInProgress,
      variant: "secondary" as const,
    };
  }
  return {
    label: labels.admin.analyticsReportStatusNotStarted,
    variant: "outline" as const,
  };
}

export function StudentAnswerBatchReport({
  selectedRows,
  onBack,
  generatedAt,
}: {
  selectedRows: StudentAnswerReviewRow[];
  onBack: () => void;
  generatedAt?: string;
}) {
  const [reportTimestamp] = useState(() => generatedAt ?? new Date().toISOString());
  const generatedLabel = formatAdminDateTime(reportTimestamp);

  const totalStudents = selectedRows.length;
  const totalCorrect = selectedRows.reduce((sum, r) => sum + r.correct, 0);
  const totalIncorrect = selectedRows.reduce((sum, r) => sum + r.incorrect, 0);
  const totalUnanswered = selectedRows.reduce((sum, r) => sum + r.unanswered, 0);
  const totalAnswered = totalCorrect + totalIncorrect;
  const totalSlots = selectedRows.reduce((sum, r) => sum + r.totalSlots, 0);

  const averageAccuracy = useMemo(() => {
    return totalAnswered > 0
      ? Math.round((totalCorrect / totalAnswered) * 100)
      : 0;
  }, [totalAnswered, totalCorrect]);

  const pdfSlug =
    totalStudents === 1
      ? selectedRows[0]?.name
          ?.trim()
          ?.toLowerCase()
          ?.replace(/[^a-z0-9]+/g, "-")
          ?.replace(/^-|-$/g, "") || "student"
      : `selected-${totalStudents}-students`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="min-h-11 gap-2"
        >
          <ArrowLeft className="size-4" />
          {labels.admin.analyticsBackToRoster}
        </Button>
        <PrintReportToolbar
          pdfFileName={`learning-report-${pdfSlug}.pdf`}
          printRootSelector="#batch-answer-report-print"
        />
      </div>

      <article
        id="batch-answer-report-print"
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
            {labels.admin.analyticsReportBatchTitle}
          </h2>
          <p className="text-sm text-muted-foreground print:text-neutral-700">
            {labels.admin.analyticsReportBatchSubtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground print:text-neutral-700">
            <span>{labels.admin.analyticsReportGeneratedOn(generatedLabel)}</span>
            <span>•</span>
            <span className="font-medium text-foreground print:text-black">
              {labels.admin.analyticsReportScope(totalStudents)}
            </span>
          </div>
        </header>

        {/* Executive Summary KPIs */}
        <section className="space-y-3 break-inside-avoid">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground print:text-black">
            {labels.admin.analyticsReviewSummary}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
            <div className="rounded-lg border border-border p-3 text-center print:border-neutral-400">
              <p className="text-xs text-muted-foreground print:text-neutral-700">
                {labels.admin.analyticsReportTotalStudents}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
                {totalStudents}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center print:border-neutral-400">
              <p className="text-xs text-muted-foreground print:text-neutral-700">
                {labels.admin.analyticsReportTotalAnswered}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
                {totalAnswered}
                {totalSlots > 0 ? (
                  <span className="text-xs font-normal text-muted-foreground print:text-neutral-700">
                    {" "}/ {totalSlots}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center print:border-neutral-400">
              <p className="text-xs text-muted-foreground print:text-neutral-700">
                {labels.admin.analyticsCorrect} / {labels.admin.analyticsIncorrect}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
                <span className="text-emerald-600 print:text-black">
                  {totalCorrect}
                </span>
                <span className="text-muted-foreground"> / </span>
                <span className="text-rose-600 print:text-black">
                  {totalIncorrect}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground print:text-neutral-700">
                {totalUnanswered} {labels.admin.analyticsUnanswered.toLowerCase()}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center print:border-neutral-400">
              <p className="text-xs text-muted-foreground print:text-neutral-700">
                {labels.admin.analyticsReportAverageAccuracy}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl text-primary print:text-black">
                {averageAccuracy}%
              </p>
            </div>
          </div>
        </section>

        {/* Single Student Extra Highlight */}
        {totalStudents === 1 && selectedRows[0] ? (
          <section className="rounded-lg border border-primary/20 bg-primary/5 p-4 print:hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  {selectedRows[0].name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedRows[0].email}
                  {selectedRows[0].studentId ? ` • ID: ${selectedRows[0].studentId}` : ""}
                  {selectedRows[0].institution ? ` • ${selectedRows[0].institution}` : ""}
                </p>
              </div>
              <Button asChild size="sm" variant="default" className="min-h-10 gap-2">
                <Link
                  href={`/admin/analytics/users/${selectedRows[0].userId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-4" />
                  {labels.admin.analyticsReportViewSingleDetail}
                </Link>
              </Button>
            </div>
          </section>
        ) : null}

        {/* Selected Students Table */}
        <section className="space-y-3 break-inside-avoid">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground print:text-black">
            {labels.admin.analyticsStudentReviewTitle}
          </h3>
          <div className="overflow-x-auto rounded-lg border border-border print:border-neutral-400">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground print:border-black print:bg-neutral-100 print:text-black">
                <tr>
                  <th className="px-3 py-2.5 font-medium">#</th>
                  <th className="px-3 py-2.5 font-medium">
                    {labels.admin.analyticsStudentName}
                  </th>
                  <th className="px-3 py-2.5 font-medium">
                    {labels.admin.analyticsReportFieldStudentId}
                  </th>
                  <th className="px-3 py-2.5 font-medium">
                    {labels.admin.analyticsReportFieldInstitution}
                  </th>
                  <th className="px-3 py-2.5 font-medium tabular-nums">
                    {labels.admin.analyticsCorrect}
                  </th>
                  <th className="px-3 py-2.5 font-medium tabular-nums">
                    {labels.admin.analyticsIncorrect}
                  </th>
                  <th className="px-3 py-2.5 font-medium tabular-nums">
                    {labels.admin.analyticsUnanswered}
                  </th>
                  <th className="px-3 py-2.5 font-medium tabular-nums">
                    {labels.admin.analyticsReportAccuracy}
                  </th>
                  <th className="px-3 py-2.5 font-medium">
                    {labels.admin.analyticsReportStatus}
                  </th>
                  <th className="px-3 py-2.5 font-medium print:hidden">
                    <span className="sr-only">
                      {labels.admin.analyticsOpenReview}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedRows.map((row, index) => {
                  const answered = row.correct + row.incorrect;
                  const accuracy =
                    answered > 0
                      ? Math.round((row.correct / answered) * 100)
                      : 0;
                  const status = getStudentStatus(row);

                  return (
                    <tr
                      key={row.userId}
                      className="border-b border-border last:border-0 print:border-neutral-300"
                    >
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground print:text-black">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-foreground print:text-black">
                          {row.name}
                        </div>
                        <div className="text-xs text-muted-foreground print:text-neutral-700">
                          {row.email}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground print:text-neutral-700">
                        {row.studentId || "-"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground print:text-neutral-700">
                        {row.institution || "-"}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-emerald-600 print:text-black">
                        {row.correct}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-rose-600 print:text-black">
                        {row.incorrect}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground print:text-black">
                        {row.unanswered}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums font-semibold">
                        {answered > 0 ? `${accuracy}%` : "-"}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right print:hidden">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-2 text-xs"
                        >
                          <Link
                            href={`/admin/analytics/users/${row.userId}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${labels.admin.analyticsOpenReview}: ${row.name}`}
                          >
                            <ExternalLink className="size-3.5" />
                            {labels.admin.analyticsOpenReview}
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer & Signature Section */}
        <footer className="space-y-8 border-t border-border pt-6 print:border-black">
          <p className="text-xs text-muted-foreground print:text-neutral-700">
            {labels.admin.analyticsReportBatchFooterNote}
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
