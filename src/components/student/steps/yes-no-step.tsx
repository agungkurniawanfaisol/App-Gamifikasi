"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitContentAnswer } from "@/actions/student/quiz";
import { AnswerFeedback } from "@/components/student/answer-feedback";
import { notifySubmitRewards } from "@/lib/proficiency-toast";
import type { SubmitAnswerHandler } from "@/lib/submit-answer";
import { cn } from "@/lib/utils";
import { labels } from "@/lib/labels";
import { toast } from "sonner";
import { Check, ThumbsDown, ThumbsUp, X } from "lucide-react";

export function YesNoStep({
  contentItemId,
  questionText,
  subQuestionIndex = 0,
  onAnswered,
  submitAnswer,
}: {
  contentItemId: number;
  questionText: string;
  subQuestionIndex?: number;
  onAnswered: (correct: boolean) => void;
  submitAnswer?: SubmitAnswerHandler;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSelect(answer: string) {
    if (selected !== null) return;
    setSelected(answer);
    setLoading(true);
    try {
      const result = submitAnswer
        ? await submitAnswer(answer)
        : await submitContentAnswer(
            contentItemId,
            answer,
            undefined,
            subQuestionIndex
          );
      setIsCorrect(result.isCorrect);
      setCorrectAnswer(result.correctAnswer ?? null);
      setExplanation(result.explanation ?? null);
      if (!submitAnswer) {
        notifySubmitRewards(result, () => router.refresh());
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
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { value: "Yes", icon: ThumbsUp, label: "Yes" },
          { value: "No", icon: ThumbsDown, label: "No" },
        ].map(({ value, icon: Icon, label }) => {
          const isSelected = selected === value;
          const isCorrectOption =
            selected !== null && correctAnswer === value && !isCorrect;
          return (
            <button
              key={value}
              type="button"
              disabled={selected !== null || loading}
              onClick={() => handleSelect(value)}
              className={cn(
                "group flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-6 py-8 text-center transition-all duration-200",
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
                selected !== null && !isSelected && !isCorrectOption && "opacity-40"
              )}
            >
              <Icon
                className={cn(
                  "size-10 transition-all",
                  !isSelected &&
                    !isCorrectOption &&
                    "text-muted-foreground group-hover:text-primary",
                  (isSelected && isCorrect === true) || isCorrectOption
                    ? "text-success"
                    : "",
                  isSelected && isCorrect === false && "text-destructive"
                )}
              />
              <span
                className={cn(
                  "text-lg font-bold",
                  (isSelected && isCorrect === true) || isCorrectOption
                    ? "text-success"
                    : "",
                  isSelected && isCorrect === false && "text-destructive",
                  !isSelected && !isCorrectOption && "text-foreground"
                )}
              >
                {label}
              </span>
              {(isSelected || isCorrectOption) && (
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full",
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
