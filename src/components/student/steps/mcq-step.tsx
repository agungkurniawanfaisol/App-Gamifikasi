"use client";

import { useState } from "react";
import { submitContentAnswer } from "@/actions/student/quiz";
import { AnswerFeedback } from "@/components/student/answer-feedback";
import { notifySubmitRewards } from "@/lib/proficiency-toast";
import type { SubmitAnswerHandler } from "@/lib/submit-answer";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function McqStep({
  contentItemId,
  questionText,
  options,
  subQuestionIndex = 0,
  onAnswered,
  submitAnswer,
}: {
  contentItemId: number;
  questionText: string;
  options: string[];
  subQuestionIndex?: number;
  onAnswered: (correct: boolean) => void;
  submitAnswer?: SubmitAnswerHandler;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const optionLabels = ["A", "B", "C", "D"];

  async function handleSelect(option: string) {
    if (selected !== null) return;
    setSelected(option);
    setLoading(true);
    try {
      const result = submitAnswer
        ? await submitAnswer(option)
        : await submitContentAnswer(
            contentItemId,
            option,
            undefined,
            subQuestionIndex
          );
      setIsCorrect(result.isCorrect);
      setCorrectAnswer(result.correctAnswer ?? null);
      setExplanation(result.explanation ?? null);
      if (!submitAnswer) {
        notifySubmitRewards(result);
      }
      onAnswered(result.isCorrect);
    } catch (error) {
      setSelected(null);
      toast.error(
        error instanceof Error ? error.message : labels.student.answerSaveFailed
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium leading-relaxed">{questionText}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrectOption =
            selected !== null && correctAnswer === opt && !isCorrect;
          return (
            <button
              key={i}
              type="button"
              disabled={selected !== null || loading}
              onClick={() => handleSelect(opt)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-200",
                "hover:border-primary/30 hover:bg-primary/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                !isSelected && !isCorrectOption && "border-border bg-card",
                isSelected &&
                  isCorrect === true &&
                  "border-success bg-success/5 shadow-sm shadow-success/10",
                isSelected &&
                  isCorrect === false &&
                  "border-destructive bg-destructive/5 shadow-sm shadow-destructive/10",
                isCorrectOption &&
                  "border-success bg-success/5 shadow-sm shadow-success/10",
                selected !== null && !isSelected && !isCorrectOption && "opacity-50"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all",
                  !isSelected &&
                    !isCorrectOption &&
                    "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                  isSelected && isCorrect === true && "bg-success text-success-foreground",
                  isSelected && isCorrect === false && "bg-destructive text-destructive-foreground",
                  isCorrectOption && "bg-success text-success-foreground"
                )}
              >
                {optionLabels[i]}
              </span>

              <span className="flex-1 font-medium">{opt}</span>

              {(isSelected || isCorrectOption) && (
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    (isCorrect === true || isCorrectOption) && "bg-success/20 text-success",
                    isSelected && isCorrect === false && "bg-destructive/20 text-destructive"
                  )}
                >
                  {isCorrect === true || isCorrectOption ? (
                    <Check className="size-4" />
                  ) : (
                    <X className="size-4" />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selected !== null && isCorrect !== null && (
        <AnswerFeedback
          isCorrect={isCorrect}
          correctAnswer={correctAnswer}
          explanation={explanation}
        />
      )}
    </div>
  );
}
