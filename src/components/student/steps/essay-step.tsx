"use client";

import { useState } from "react";
import { submitContentAnswer } from "@/actions/student/quiz";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { labels } from "@/lib/labels";
import { notifySubmitRewards } from "@/lib/proficiency-toast";
import type { SubmitAnswerHandler } from "@/lib/submit-answer";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EssayStep({
  contentItemId,
  questionText,
  essayRubric,
  subQuestionIndex = 0,
  onAnswered,
  submitAnswer,
  initiallyAnswered = false,
}: {
  contentItemId: number;
  questionText: string;
  essayRubric?: string;
  subQuestionIndex?: number;
  onAnswered: () => void;
  submitAnswer?: SubmitAnswerHandler;
  initiallyAnswered?: boolean;
}) {
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(initiallyAnswered);

  async function handleSubmit() {
    if (!text.trim() || loading || submitted) return;
    setLoading(true);
    const answerText = text.trim();
    try {
      const result = submitAnswer
        ? await submitAnswer(answerText)
        : await submitContentAnswer(
            contentItemId,
            answerText,
            undefined,
            subQuestionIndex
          );
      setSubmitted(true);
      onAnswered();
      if (!submitAnswer) {
        notifySubmitRewards(result);
      }
      void loadFeedback(answerText);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : labels.student.answerSaveFailed
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadFeedback(answerText: string) {
    try {
      const res = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentItemId,
          subQuestionIndex,
          userAnswer: answerText,
        }),
      });
      const data = (await res.json()) as { feedback?: string };
      setFeedback(data.feedback ?? labels.student.feedbackUnavailable);
    } catch {
      setFeedback(labels.student.feedbackLoadError);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium leading-relaxed">{questionText}</p>

      {essayRubric && !submitted && (
        <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-500/5 px-4 py-3 text-xs text-muted-foreground">
          <span className="font-medium text-amber-600 dark:text-amber-400">Rubric: </span>
          {essayRubric}
        </div>
      )}

      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={labels.student.essayPlaceholder}
          rows={6}
          disabled={submitted}
          className={cn(
            "resize-y transition-shadow",
            submitted && "border-success/50 bg-success/5"
          )}
        />
        {!submitted && text.length > 0 && (
          <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground">
            {text.length} chars
          </div>
        )}
      </div>

      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className="w-full gap-2 sm:w-auto"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {labels.student.submitAnswer}
        </Button>
      ) : (
        <div className="animate-slide-up space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-success">
            <CheckCircle2 className="size-4" />
            Answer submitted
          </div>
          {feedback && (
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm leading-relaxed">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                AI Feedback
              </p>
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
