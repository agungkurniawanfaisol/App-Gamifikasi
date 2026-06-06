"use client";

import { Check, Lightbulb, X } from "lucide-react";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function AnswerFeedback({
  isCorrect,
  correctAnswer,
  explanation,
}: {
  isCorrect: boolean;
  correctAnswer?: string | null;
  explanation?: string | null;
}) {
  return (
    <div className="animate-slide-up flex flex-col gap-3">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold",
          isCorrect
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive"
        )}
      >
        {isCorrect ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
        {isCorrect ? labels.student.correctAnswer : labels.student.wrongAnswer}
      </div>

      {!isCorrect && correctAnswer && (
        <div className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm">
          <p className="font-semibold text-success">{labels.student.correctAnswerIs}</p>
          <p className="mt-1 text-foreground">{correctAnswer}</p>
        </div>
      )}

      {explanation?.trim() && (
        <div className="flex gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-foreground">{labels.student.explanation}</p>
            <p className="mt-1 text-muted-foreground">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
