import Link from "next/link";
import type { StudentAnswerReviewRoster } from "@/lib/admin-student-answer-review";
import { Button } from "@/components/ui/button";
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
import { labels } from "@/lib/labels";

export function StudentAnswerRoster({
  roster,
}: {
  roster: StudentAnswerReviewRoster;
}) {
  const { rows, page, totalPages, totalStudents } = roster;

  if (totalStudents === 0) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <p className="text-sm text-muted-foreground">
            {labels.admin.analyticsReviewEmpty}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base">
            {labels.admin.analyticsStudentReviewTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {labels.admin.analyticsStudentReviewDescription}
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <ResponsiveTable
            mobile={rows.map((row) => (
              <ResponsiveTableCard key={row.userId} className="space-y-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {row.email}
                  </p>
                </div>
                <dl className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {labels.admin.analyticsCorrect}
                    </dt>
                    <dd className="font-semibold">{row.correct}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {labels.admin.analyticsIncorrect}
                    </dt>
                    <dd className="font-semibold">{row.incorrect}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {labels.admin.analyticsUnanswered}
                    </dt>
                    <dd className="font-semibold">{row.unanswered}</dd>
                  </div>
                </dl>
                <Button asChild variant="outline" className="min-h-11 w-full">
                  <Link href={`/admin/analytics/users/${row.userId}`}>
                    {labels.admin.analyticsOpenReview}
                  </Link>
                </Button>
              </ResponsiveTableCard>
            ))}
            desktop={
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">
                        {labels.admin.analyticsStudentName}
                      </th>
                      <th className="px-4 py-3 font-medium">
                        {labels.admin.analyticsStudentEmail}
                      </th>
                      <th className="px-4 py-3 font-medium tabular-nums">
                        {labels.admin.analyticsCorrect}
                      </th>
                      <th className="px-4 py-3 font-medium tabular-nums">
                        {labels.admin.analyticsIncorrect}
                      </th>
                      <th className="px-4 py-3 font-medium tabular-nums">
                        {labels.admin.analyticsUnanswered}
                      </th>
                      <th className="px-4 py-3 font-medium">
                        <span className="sr-only">
                          {labels.admin.analyticsOpenReview}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.userId} className="border-b last:border-0">
                        <td className="max-w-[12rem] truncate px-4 py-3 font-medium">
                          {row.name}
                        </td>
                        <td className="max-w-[14rem] truncate px-4 py-3 text-muted-foreground">
                          {row.email}
                        </td>
                        <td className="px-4 py-3 tabular-nums">{row.correct}</td>
                        <td className="px-4 py-3 tabular-nums">
                          {row.incorrect}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {row.unanswered}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            aria-label={`${labels.admin.analyticsOpenReview}: ${row.name}`}
                          >
                            <Link
                              href={`/admin/analytics/users/${row.userId}`}
                            >
                              {labels.admin.analyticsOpenReview}
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          />
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex flex-col-reverse items-stretch gap-2 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {labels.admin.analyticsPageOf(page, totalPages)}
          </p>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="min-h-11 flex-1 sm:flex-none"
              disabled={page <= 1}
            >
              <Link
                href={
                  page <= 2
                    ? "/admin/analytics?tab=review"
                    : `/admin/analytics?tab=review&page=${page - 1}`
                }
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
              >
                {labels.admin.analyticsPrevPage}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-11 flex-1 sm:flex-none"
              disabled={page >= totalPages}
            >
              <Link
                href={`/admin/analytics?tab=review&page=${page + 1}`}
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              >
                {labels.admin.analyticsNextPage}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
