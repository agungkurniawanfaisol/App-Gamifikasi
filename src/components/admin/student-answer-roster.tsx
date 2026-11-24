"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckSquare,
  FileText,
  RotateCcw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import type {
  StudentAnswerReviewRoster,
  StudentAnswerReviewRow,
} from "@/lib/admin-student-answer-review";
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

const SESSION_STORAGE_KEY = "admin_analytics_selected_students_v1";
const PAGE_SIZE_OPTIONS = ["25", "50", "75", "100", "all"] as const;

function getInitialSelectedMap(): Record<number, StudentAnswerReviewRow> {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to parse selected students from sessionStorage", err);
  }
  return {};
}

export function StudentAnswerRoster({
  roster,
}: {
  roster: StudentAnswerReviewRoster;
}) {
  const { rows, page, totalPages, totalStudents } = roster;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedMap, setSelectedMap] = useState<
    Record<number, StudentAnswerReviewRow>
  >(() => getInitialSelectedMap());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "unstarted" | "selected"
  >("all");
  const [isReportMode, setIsReportMode] = useState(false);
  const searchInputId = useId();
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  function updateSelectedMap(
    updater: (
      prev: Record<number, StudentAnswerReviewRow>
    ) => Record<number, StudentAnswerReviewRow>
  ) {
    setSelectedMap((prev) => {
      const next = updater(prev);
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to store selected students to sessionStorage", err);
      }
      return next;
    });
  }

  const selectedRows = useMemo(() => {
    return Object.values(selectedMap);
  }, [selectedMap]);

  const selectedCount = selectedRows.length;

  // Selected students on current page
  const selectedOnCurrentPageCount = useMemo(() => {
    return rows.filter((r) => Boolean(selectedMap[r.userId])).length;
  }, [rows, selectedMap]);

  // Current page size query
  const rawPageSizeParam = searchParams.get("pageSize");
  const currentPageSize =
    rawPageSizeParam === "all"
      ? "all"
      : rawPageSizeParam && PAGE_SIZE_OPTIONS.includes(rawPageSizeParam as (typeof PAGE_SIZE_OPTIONS)[number])
        ? rawPageSizeParam
        : "50";

  // Build page URL helper
  function buildNavigationUrl(targetPage: number, targetPageSize?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "review");

    if (targetPage > 1) {
      params.set("page", String(targetPage));
    } else {
      params.delete("page");
    }

    const pageSizeToUse = targetPageSize ?? rawPageSizeParam;
    if (pageSizeToUse && pageSizeToUse !== "50") {
      params.set("pageSize", pageSizeToUse);
    } else {
      params.delete("pageSize");
    }

    const qs = params.toString();
    return qs ? `/admin/analytics?${qs}` : "/admin/analytics?tab=review";
  }

  function handlePageSizeChange(newSize: string) {
    const url = buildNavigationUrl(1, newSize);
    router.push(url, { scroll: false });
  }

  // Filtered rows
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // If statusFilter is "selected", show all selected students across pages
    if (statusFilter === "selected") {
      return selectedRows.filter((row) => {
        if (!q) return true;
        return (
          row.name.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          Boolean(row.studentId && row.studentId.toLowerCase().includes(q)) ||
          Boolean(row.institution && row.institution.toLowerCase().includes(q))
        );
      });
    }

    return rows.filter((row) => {
      const matchesSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        Boolean(row.studentId && row.studentId.toLowerCase().includes(q)) ||
        Boolean(row.institution && row.institution.toLowerCase().includes(q));

      const hasWorked = row.correct + row.incorrect > 0;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? hasWorked
            : !hasWorked;

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchQuery, statusFilter, selectedRows]);

  const isAllVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((r) => Boolean(selectedMap[r.userId]));

  const isSomeVisibleSelected =
    filteredRows.some((r) => Boolean(selectedMap[r.userId])) &&
    !isAllVisibleSelected;

  // Sync indeterminate property on native checkbox ref
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeVisibleSelected;
    }
  }, [isSomeVisibleSelected]);

  function toggleSelectOne(row: StudentAnswerReviewRow) {
    updateSelectedMap((prev) => {
      const next = { ...prev };
      if (next[row.userId]) {
        delete next[row.userId];
      } else {
        next[row.userId] = row;
      }
      return next;
    });
  }

  function handleSelectAllVisible() {
    updateSelectedMap((prev) => {
      const next = { ...prev };
      if (isAllVisibleSelected) {
        for (const r of filteredRows) {
          delete next[r.userId];
        }
      } else {
        for (const r of filteredRows) {
          next[r.userId] = r;
        }
      }
      return next;
    });
  }

  function handleSelectWorkedOnPage() {
    updateSelectedMap((prev) => {
      const next = { ...prev };
      for (const r of filteredRows) {
        if (r.correct + r.incorrect > 0) {
          next[r.userId] = r;
        }
      }
      return next;
    });
  }

  function handleClearSelection() {
    updateSelectedMap(() => ({}));
  }

  if (isReportMode && selectedCount > 0) {
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

  // Calculate range for info banner
  const startItem = (page - 1) * rows.length + 1;
  const endItem = startItem + rows.length - 1;

  return (
    <div className="space-y-4">
      {/* Persistent Cross-Page Selection Hub / Floating Banner */}
      {selectedCount > 0 ? (
        <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-card p-3 shadow-md sm:p-4 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="gap-1.5 px-3 py-1 font-medium">
              <Users className="size-3.5" />
              {labels.admin.analyticsSelectedAcrossPages(
                selectedCount,
                selectedOnCurrentPageCount
              )}
            </Badge>
            <span className="text-xs text-muted-foreground">
              (Selections preserved across pages)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="default"
              className="min-h-10 gap-2 font-medium"
              onClick={() => setIsReportMode(true)}
            >
              <FileText className="size-4" />
              {labels.admin.analyticsGenerateReport(selectedCount)}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleClearSelection}
              className="min-h-10 gap-1.5 text-xs text-muted-foreground"
            >
              <RotateCcw className="size-3.5" />
              {labels.admin.analyticsClearSelection}
            </Button>
          </div>
        </div>
      ) : null}

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

            {/* Showing Range Indicator */}
            <p className="text-xs font-medium text-muted-foreground">
              {currentPageSize === "all"
                ? labels.admin.analyticsShowingAll(totalStudents)
                : labels.admin.analyticsShowingRange(
                    startItem,
                    Math.min(endItem, totalStudents),
                    totalStudents
                  )}
            </p>
          </div>

          {/* Search, Filter, Page Size, and Quick Selection Controls */}
          <div className="mt-4 flex flex-col gap-3 pt-2 lg:flex-row lg:items-center lg:justify-between">
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
              {/* Status Filter Buttons */}
              <div className="flex items-center rounded-lg border bg-muted/40 p-1 text-xs">
                {(
                  [
                    { key: "all", label: labels.admin.analyticsFilterAll },
                    { key: "active", label: labels.admin.analyticsFilterActive },
                    { key: "unstarted", label: labels.admin.analyticsFilterUnstarted },
                    ...(selectedCount > 0
                      ? [
                          {
                            key: "selected" as const,
                            label: labels.admin.analyticsFilterSelected(selectedCount),
                          },
                        ]
                      : []),
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

              {/* Rows Per Page Selector (25, 50, 75, 100, All) */}
              <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1 text-xs">
                <span className="px-2 text-muted-foreground font-medium">
                  {labels.admin.analyticsPageSize}:
                </span>
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handlePageSizeChange(opt)}
                    className={`rounded-md px-2 py-1 font-medium transition-colors ${
                      currentPageSize === opt
                        ? "bg-background text-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt === "all" ? labels.admin.analyticsPageSizeAll : opt}
                  </button>
                ))}
              </div>

              {/* Quick Select Buttons */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectWorkedOnPage}
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
              const isSelected = Boolean(selectedMap[row.userId]);
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
                      onChange={() => toggleSelectOne(row)}
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
                          ref={headerCheckboxRef}
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
                        const isSelected = Boolean(selectedMap[row.userId]);
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
                                onChange={() => toggleSelectOne(row)}
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

      {/* Pagination (hidden when showing All or only 1 page) */}
      {totalPages > 1 && currentPageSize !== "all" && (
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
                href={buildNavigationUrl(page - 1)}
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
                href={buildNavigationUrl(page + 1)}
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
