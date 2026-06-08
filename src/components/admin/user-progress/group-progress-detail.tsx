"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AdminGroupProgressClient } from "@/lib/admin-user-progress";
import { formatAdminDate } from "@/lib/format-date";
import { labels } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

function AssessmentSection({
  title,
  phase,
}: {
  title: string;
  phase: AdminGroupProgressClient["pretest"];
}) {
  if (phase.total === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        {labels.admin.userProgress.noAssessmentQuestions}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title} ({phase.answered}/{phase.total})
      </p>
      <ul className="space-y-2">
        {phase.answers.map((answer) => (
          <li
            key={answer.questionId}
            className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-2"
          >
            <div className="min-w-0 space-y-1">
              <span className="block text-sm leading-snug">{answer.questionText}</span>
              {answer.answeredAt && (
                <span className="text-[11px] text-muted-foreground">
                  {formatAdminDate(answer.answeredAt)}
                </span>
              )}
            </div>
            <Badge
              variant={answer.value != null ? "secondary" : "outline"}
              className="shrink-0 tabular-nums"
            >
              {answer.value != null
                ? labels.admin.userProgress.assessmentAnswer(answer.value)
                : labels.admin.userProgress.noAnswer}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GroupProgressDetail({ group }: { group: AdminGroupProgressClient }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
        >
          {open
            ? labels.admin.userProgress.collapseDetails
            : labels.admin.userProgress.expandDetails}
          <ChevronDown
            className={cn("size-3.5 transition-transform", open && "rotate-180")}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4 rounded-lg border border-border/60 bg-muted/5 p-4">
        <AssessmentSection title={labels.admin.pretest} phase={group.pretest} />
        <AssessmentSection title={labels.admin.posttest} phase={group.posttest} />
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {labels.admin.userProgress.contentSummary}
          </p>
          <p className="text-sm text-muted-foreground">
            {labels.admin.userProgress.contentAnswerStats(
              group.contentAnswers.correct,
              group.contentAnswers.incorrect
            )}
          </p>
        </div>

        {group.aiCompletionFeedback && (
          <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {labels.admin.userProgress.completionFeedbackTitle}
            </p>
            <p className="line-clamp-3 text-sm leading-relaxed">
              {group.aiCompletionFeedback}
            </p>
          </div>
        )}

        {group.testimonialText && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {labels.admin.testimonialText}
            </p>
            {group.testimonialRating != null && (
              <Badge variant="secondary">
                {labels.admin.userProgress.testimonialRating(group.testimonialRating)}
              </Badge>
            )}
            <p className="text-sm italic leading-relaxed text-muted-foreground">
              &ldquo;{group.testimonialText}&rdquo;
            </p>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
