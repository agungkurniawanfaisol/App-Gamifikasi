"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  FileText,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import type { StudentAnswerReviewRoster } from "@/lib/admin-student-answer-review";
import { StudentAnswerBatchReport } from "@/components/admin/student-answer-batch-report";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unstarted">("all");
  const [isReportMode, setIsReportMode] = useState(false);
  const searchInputId = useId();

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        (row.studentId && row.studentId.toLowerCase().includes(q)) ||
        (row.institution && row.institution.toLowerCase().includes(q));

      const hasWorked = row.correct + row.incorrect > 0;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? hasWorked
            : !hasWorked;

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchQuery, statusFilter]);

  const selectedRows = useMemo(() => {
    return rows.filter((r) => selectedUserIds.has(r.userId));
  }, [rows, selectedUserIds]);

  const isAllVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((r) => selectedUserIds.has(r.userId));

  function toggleSelectOne(userId: number) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  function handleSelectAllVisible() {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (isAllVisibleSelected) {
        for (const r of filteredRows) {
          next.delete(r.userId);
        }
      } else {
        for (const r of filteredRows) {
          next.add(r.userId);
        }
      }
      return next;
    });
  }

  function handleSelectWorked() {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      for (const r of filteredRows) {
        if (r.correct + r.incorrect > 0) {
          next.add(r.userId);
        }
      }
      return next;
    });
  }

  function handleClearSelection() {
    setSelectedUserIds(new Set());
  }

  if (isReportMode && selectedRows.length > 0) {
    return (
      <StudentAnswerBatchReport
        selectedRows={selectedRows}
        onBack={() => setIsReportMode(false)}
      />
    );
  }

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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">
                {labels.admin.analyticsStudentReviewTitle}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {labels.admin.analyticsStudentReviewDescription}
              </p>
            </div>
            {selectedUserIds.size > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 font-medium">
                  {labels.admin.analyticsSelectedCount(selectedUserIds.size)}
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  className="min-h-10 gap-2"
                  onClick={() => setIsReportMode(true)}
                >
                  <FileText className="size-4" />
                  {labels.admin.analyticsGenerateReport(selectedUserIds.size)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleClearSelection}
                  className="h-10 px-2 text-xs text-muted-foreground"
                >
                  <RotateCcw className="size-3.5 mr-1" />
                  {labels.admin.analyticsClearSelection}
                </Button>
              </div>
            ) : null}
          </div>

          {/* Search, Filter, and Quick Selection Controls */}
          <div className="mt-4 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={searchInputId}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={labels.admin.analyticsSearchPlaceholder}
                className="pl-9 min-h-10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-lg border bg-muted/40 p-1 text-xs">
                {(
                  [
                    { key: "all", label: labels.admin.analyticsFilterAll },
                    { key: "active", label: labels.admin.analyticsFilterActive },
                    { key: "unstarted", label: labels.admin.analyticsFilterUnstarted },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setStatusFilter(opt.key)}
                    className={`rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                      statusFilter === opt.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectWorked}
                className="min-h-10 gap-1.5 text-xs"
              >
                <Sparkles className="size-3.5 text-amber-500" />
                {labels.admin.analyticsSelectActive}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllVisible}
                className="min-h-10 gap-1.5 text-xs"
              >
                <CheckSquare className="size-3.5" />
                {labels.admin.analyticsSelectAll}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <ResponsiveTable
            mobile={filteredRows.map((row) => {
              const isSelected = selectedUserIds.has(row.userId);
              return (
                <ResponsiveTableCard
                  key={row.userId}
                  className={`space-y-3 transition-colors ${
                    isSelected ? "border-primary/50 bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(row.userId)}
                      aria-label={`Select ${row.name}`}
                      className="mt-1 size-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{row.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {row.email}
                      </p>
                      {row.studentId || row.institution ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {[row.studentId, row.institution]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        {labels.admin.analyticsCorrect}
                      </dt>
                      <dd className="font-semibold text-emerald-600">
                        {row.correct}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        {labels.admin.analyticsIncorrect}
                      </dt>
                      <dd className="font-semibold text-rose-600">
                        {row.incorrect}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        {labels.admin.analyticsUnanswered}
                      </dt>
                      <dd className="font-semibold text-muted-foreground">
                        {row.unanswered}
                      </dd>
                    </div>
                  </dl>
                  <Button asChild variant="outline" className="min-h-11 w-full">
                    <Link href={`/admin/analytics/users/${row.userId}`}>
                      {labels.admin.analyticsOpenReview}
                    </Link>
                  </Button>
                </ResponsiveTableCard>
              );
            })}
            desktop={
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isAllVisibleSelected}
                          onChange={handleSelectAllVisible}
                          aria-label={labels.admin.analyticsSelectAll}
                          className="size-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </th>
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
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-sm text-muted-foreground"
                        >
                          {labels.admin.analyticsReviewEmpty}
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => {
                        const isSelected = selectedUserIds.has(row.userId);
                        return (
                          <tr
                            key={row.userId}
                            className={`border-b last:border-0 transition-colors ${
                              isSelected ? "bg-muted/50" : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectOne(row.userId)}
                                aria-label={`Select ${row.name}`}
                                className="size-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring"
                              />
                            </td>
                            <td className="max-w-[12rem] truncate px-4 py-3 font-medium">
                              <div>{row.name}</div>
                              {row.studentId ? (
                                <div className="text-xs text-muted-foreground">
                                  {row.studentId}
                                </div>
                              ) : null}
                            </td>
                            <td className="max-w-[14rem] truncate px-4 py-3 text-muted-foreground">
                              <div>{row.email}</div>
                              {row.institution ? (
                                <div className="text-xs text-muted-foreground/80">
                                  {row.institution}
                                </div>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 tabular-nums text-emerald-600 font-medium">
                              {row.correct}
                            </td>
                            <td className="px-4 py-3 tabular-nums text-rose-600 font-medium">
                              {row.incorrect}
                            </td>
                            <td className="px-4 py-3 tabular-nums text-muted-foreground">
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
                        );
                      })
                    )}
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
