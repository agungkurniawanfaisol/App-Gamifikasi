"use client";

import { useState, useTransition } from "react";
import { AssessmentPhase } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { submitAssessmentAnswer } from "@/actions/student/assessments";
import type {
  AssessmentAnswerRecord,
  AssessmentQuestionPayload,
} from "@/lib/assessments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function AssessmentStep({
  phase,
  levelId,
  groupId,
  questions,
  initialAnswers,
  currentIndex,
  onCurrentIndexChange,
  onAnswered,
  onComplete,
}: {
  phase: AssessmentPhase;
  levelId: number;
  groupId: number;
  questions: AssessmentQuestionPayload[];
  initialAnswers: AssessmentAnswerRecord[];
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
  onAnswered?: (questionId: number, value: number) => void;
  onComplete: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Map<number, number>>(
    () => new Map(initialAnswers.map((a) => [a.questionId, a.value]))
  );

  const current = questions[currentIndex];
  const currentValue = current ? answers.get(current.id) : undefined;
  const allAnswered = questions.every((q) => answers.has(q.id));
  const unansweredCount = questions.filter((q) => !answers.has(q.id)).length;
  const isLast = currentIndex === questions.length - 1;
  const canProceed =
    currentValue !== undefined && (!isLast || allAnswered);

  const title =
    phase === AssessmentPhase.PRETEST
      ? labels.student.pretestTitle
      : labels.student.posttestTitle;
  const intro =
    phase === AssessmentPhase.PRETEST
      ? labels.student.pretestIntro
      : labels.student.posttestIntro;
  const finishLabel =
    phase === AssessmentPhase.PRETEST
      ? labels.student.startMaterials
      : labels.student.completePosttest;

  if (!current) return null;

  function saveAnswer(value: number) {
    if (!current) return;
    setAnswers((prev) => new Map(prev).set(current.id, value));
    onAnswered?.(current.id, value);
    startTransition(async () => {
      await submitAssessmentAnswer(current.id, groupId, levelId, value);
    });
  }

  function handleNext() {
    if (currentValue === undefined) return;
    if (isLast) {
      if (allAnswered) onComplete();
      return;
    }
    onCurrentIndexChange(currentIndex + 1);
  }

  const phaseBadgeClass =
    phase === AssessmentPhase.PRETEST
      ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
      : "bg-violet-500/15 text-violet-700 dark:text-violet-300";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden sm:gap-5">
      <div className="shrink-0 rounded-xl border border-border bg-card p-4 sm:p-5">
        <Badge className={cn("mb-2", phaseBadgeClass)}>{title}</Badge>
        <p className="text-sm text-muted-foreground">{intro}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-sm sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {labels.student.assessmentQuestionOf(currentIndex + 1, questions.length)}
          </Badge>
          <Badge className={phaseBadgeClass}>
            {phase === AssessmentPhase.PRETEST
              ? labels.student.stepTypePretest
              : labels.student.stepTypePosttest}
          </Badge>
        </div>

        <p className="text-lg font-medium leading-relaxed sm:text-xl">
          {current.questionText}
        </p>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{labels.student.scaleMin}</span>
            <span>{labels.student.scaleMax}</span>
          </div>

          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={currentValue ?? 3}
            disabled={pending}
            onChange={(e) => saveAnswer(Number(e.target.value))}
            className="h-2.5 w-full cursor-pointer accent-primary"
            aria-label={labels.student.scaleLabel(currentValue ?? 3)}
          />

          <div className="flex justify-center gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                disabled={pending}
                onClick={() => saveAnswer(n)}
                className={cn(
                  "flex size-11 items-center justify-center rounded-full border text-sm font-bold transition-colors sm:size-12",
                  currentValue === n
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                {n}
              </button>
            ))}
          </div>

          {currentValue !== undefined && (
            <p className="text-center text-sm font-semibold text-primary">
              {labels.student.scaleLabel(currentValue)}
            </p>
          )}
        </div>
      </div>

      {currentValue === undefined && (
        <p className="shrink-0 text-center text-sm text-muted-foreground">
          {labels.student.answerAllAssessment}
        </p>
      )}
      {currentValue !== undefined && isLast && !allAnswered && (
        <p className="shrink-0 text-center text-sm text-amber-700 dark:text-amber-300">
          {labels.student.assessmentRemaining(unansweredCount)}
        </p>
      )}

      <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => onCurrentIndexChange(currentIndex - 1)}
          className="w-full gap-2 sm:w-auto"
        >
          <ChevronLeft className="size-4" />
          {labels.student.previous}
        </Button>
        <Button
          type="button"
          disabled={!canProceed || pending}
          onClick={handleNext}
          className="w-full gap-2 sm:w-auto"
        >
          {isLast && allAnswered ? finishLabel : labels.student.next}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
