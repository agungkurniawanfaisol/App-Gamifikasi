"use client";

import {
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import type { AdminFeedbackItemClient } from "@/lib/admin-user-progress";
import { formatAdminDate } from "@/lib/format-date";
import { getLevelLabel, labels } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function UserFeedbackDetailDialog({
  item,
  onClose,
}: {
  item: AdminFeedbackItemClient | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={item != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-2xl gap-0 overflow-hidden p-0">
        {item && (
          <>
            <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-violet-500/15 via-primary/10 to-sky-500/10 px-6 py-5">
              <div
                className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-violet-500/10 blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-10 left-1/3 size-24 rounded-full bg-sky-500/10 blur-2xl"
                aria-hidden
              />
              <DialogHeader className="relative space-y-3 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent",
                      item.kind === "completion"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                    )}
                  >
                    {item.kind === "completion" ? (
                      <Trophy className="mr-1 size-3" />
                    ) : (
                      <Sparkles className="mr-1 size-3" />
                    )}
                    {item.kind === "completion"
                      ? labels.admin.userProgress.feedbackCompletionKind
                      : labels.admin.userProgress.feedbackAnswerKind}
                  </Badge>
                  <Badge variant="secondary">{getLevelLabel(item.levelName)}</Badge>
                  <Badge variant="outline">{item.groupTitle}</Badge>
                </div>
                <DialogTitle className="text-lg leading-snug sm:text-xl">
                  {item.kind === "completion"
                    ? labels.admin.userProgress.completionFeedbackTitle
                    : item.questionLabel}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {formatAdminDate(item.createdAt)}
                </p>
              </DialogHeader>
            </div>

            <div className="max-h-[calc(92dvh-9rem)] space-y-4 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-2">
                {item.isCorrect === true && (
                  <Badge className="gap-1 bg-success/15 text-success hover:bg-success/20">
                    <CheckCircle2 className="size-3" />
                    {labels.admin.userProgress.answerCorrect}
                  </Badge>
                )}
                {item.isCorrect === false && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="size-3" />
                    {labels.admin.userProgress.answerIncorrect}
                  </Badge>
                )}
                {item.scorePercent != null && (
                  <Badge variant="outline" className="tabular-nums">
                    {labels.admin.userProgress.answerScore(item.scorePercent)}
                  </Badge>
                )}
              </div>

              {item.kind === "answer" && item.studentAnswer && (
                <section className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {labels.admin.userProgress.studentAnswer}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {item.studentAnswer}
                  </p>
                </section>
              )}

              {item.kind === "completion" && item.studentAnswer && (
                <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {labels.admin.testimonialText}
                  </p>
                  <p className="whitespace-pre-wrap text-sm italic leading-relaxed text-muted-foreground">
                    &ldquo;{item.studentAnswer}&rdquo;
                  </p>
                </section>
              )}

              <section className="relative overflow-hidden rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-500/8 via-background to-sky-500/8 p-5 shadow-sm">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-primary to-sky-500"
                  aria-hidden
                />
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                  <Sparkles className="size-4" />
                  {item.kind === "completion"
                    ? labels.admin.userProgress.completionFeedbackTitle
                    : labels.admin.userProgress.answerFeedbackTitle}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-[15px]">
                  {item.aiFeedback ?? labels.admin.userProgress.noFeedback}
                </p>
              </section>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
