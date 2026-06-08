"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  MessageSquareQuote,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import type { AdminFeedbackItemClient } from "@/lib/admin-user-progress";
import { formatAdminDate } from "@/lib/format-date";
import { getLevelLabel, labels } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { UserFeedbackDetailDialog } from "@/components/admin/user-progress/user-feedback-detail-dialog";
import { cn } from "@/lib/utils";

type FeedbackFilter =
  | "all"
  | "with_ai"
  | "correct"
  | "incorrect"
  | "completion";

const FILTERS: { id: FeedbackFilter; label: string }[] = [
  { id: "all", label: labels.admin.userProgress.feedbackFilterAll },
  { id: "with_ai", label: labels.admin.userProgress.feedbackFilterWithAi },
  { id: "correct", label: labels.admin.userProgress.feedbackFilterCorrect },
  { id: "incorrect", label: labels.admin.userProgress.feedbackFilterIncorrect },
  { id: "completion", label: labels.admin.userProgress.feedbackFilterCompletion },
];

function filterItems(
  items: AdminFeedbackItemClient[],
  filter: FeedbackFilter
): AdminFeedbackItemClient[] {
  switch (filter) {
    case "with_ai":
      return items.filter((item) => item.aiFeedback?.trim());
    case "correct":
      return items.filter((item) => item.isCorrect === true);
    case "incorrect":
      return items.filter((item) => item.isCorrect === false);
    case "completion":
      return items.filter((item) => item.kind === "completion");
    default:
      return items;
  }
}

function FeedbackCard({
  item,
  onSelect,
}: {
  item: AdminFeedbackItemClient;
  onSelect: (item: AdminFeedbackItemClient) => void;
}) {
  const hasAi = Boolean(item.aiFeedback?.trim());
  const isCompletion = item.kind === "completion";

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border text-left shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isCompletion
          ? "border-amber-500/25 bg-gradient-to-br from-amber-500/8 via-card to-orange-500/5 hover:border-amber-500/40"
          : "border-border/70 bg-card hover:border-violet-500/35"
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          isCompletion
            ? "bg-gradient-to-b from-amber-400 to-orange-500"
            : item.isCorrect === true
              ? "bg-success"
              : item.isCorrect === false
                ? "bg-destructive"
                : "bg-primary"
        )}
      />

      <div className="space-y-3 p-4 pl-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {getLevelLabel(item.levelName)}
          </Badge>
          <Badge
            variant="secondary"
            className="max-w-[10rem] truncate text-[10px]"
          >
            {item.groupTitle}
          </Badge>
          {isCompletion ? (
            <Badge className="gap-1 bg-amber-500/15 text-[10px] text-amber-700 dark:text-amber-300">
              <Trophy className="size-3" />
              {labels.admin.userProgress.feedbackCompletionKind}
            </Badge>
          ) : item.isCorrect === true ? (
            <Badge className="gap-1 bg-success/15 text-[10px] text-success">
              <CheckCircle2 className="size-3" />
              {labels.admin.userProgress.answerCorrect}
            </Badge>
          ) : item.isCorrect === false ? (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <XCircle className="size-3" />
              {labels.admin.userProgress.answerIncorrect}
            </Badge>
          ) : null}
        </div>

        <div>
          <p className="line-clamp-2 text-sm font-semibold leading-snug">
            {isCompletion
              ? labels.admin.userProgress.completionFeedbackTitle
              : item.questionLabel}
          </p>
          {item.studentAnswer && !isCompletion && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {item.studentAnswer}
            </p>
          )}
        </div>

        <div
          className={cn(
            "rounded-xl border p-3",
            hasAi
              ? "border-violet-500/20 bg-gradient-to-br from-violet-500/8 to-sky-500/5"
              : "border-dashed border-muted-foreground/25 bg-muted/20"
          )}
        >
          <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3 text-violet-500" />
            {labels.admin.userProgress.feedbackPreview}
          </p>
          <p
            className={cn(
              "line-clamp-2 text-xs leading-relaxed",
              hasAi ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {hasAi
              ? item.aiFeedback
              : labels.admin.userProgress.feedbackNoPreview}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">
            {formatAdminDate(item.createdAt)}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            {labels.admin.userProgress.feedbackViewDetail}
            <ChevronRight className="size-3.5" />
          </span>
        </div>
      </div>
    </button>
  );
}

export function UserFeedbackList({
  items,
  initialFeedbackId,
  initialGroupId,
}: {
  items: AdminFeedbackItemClient[];
  initialFeedbackId?: string | null;
  initialGroupId?: number | null;
}) {
  const [filter, setFilter] = useState<FeedbackFilter>("all");
  const [selected, setSelected] = useState<AdminFeedbackItemClient | null>(null);

  const scopedItems = useMemo(() => {
    if (!initialGroupId) return items;
    return items.filter((item) => item.groupId === initialGroupId);
  }, [items, initialGroupId]);

  const filtered = useMemo(
    () => filterItems(scopedItems, filter),
    [scopedItems, filter]
  );

  const withAiCount = useMemo(
    () => scopedItems.filter((item) => item.aiFeedback?.trim()).length,
    [scopedItems]
  );

  useEffect(() => {
    if (!initialFeedbackId) return;
    const match = items.find((item) => item.id === initialFeedbackId);
    if (match) setSelected(match);
  }, [initialFeedbackId, items]);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card to-sky-500/10 p-6 shadow-sm">
        <div
          className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-violet-500/15 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
                <MessageSquareQuote className="size-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {labels.admin.userProgress.feedbackListTitle}
              </h2>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              {labels.admin.userProgress.feedbackListSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {labels.admin.userProgress.feedbackTotal(scopedItems.length)}
            </Badge>
            <Badge
              variant="outline"
              className="border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm text-violet-700 dark:text-violet-300"
            >
              <Sparkles className="mr-1 size-3" />
              {labels.admin.userProgress.feedbackWithAiCount(withAiCount)}
            </Badge>
          </div>
        </div>
      </section>

      {initialGroupId != null && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm text-muted-foreground">
          {labels.admin.userProgress.feedbackFilterGroup}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((entry) => (
          <Button
            key={entry.id}
            type="button"
            size="sm"
            variant={filter === entry.id ? "default" : "outline"}
            className={cn(
              "rounded-full",
              filter === entry.id &&
                entry.id === "with_ai" &&
                "bg-violet-600 hover:bg-violet-600/90"
            )}
            onClick={() => setFilter(entry.id)}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      {scopedItems.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={labels.admin.userProgress.feedbackEmpty}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={labels.admin.userProgress.feedbackEmptyFilter}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      <UserFeedbackDetailDialog
        item={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
