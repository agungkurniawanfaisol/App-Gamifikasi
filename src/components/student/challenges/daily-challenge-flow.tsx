"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitDailyChallengeAnswer } from "@/actions/student/daily-challenge";
import type { DailyChallengeQuestionView } from "@/lib/daily-challenge-service";
import { QuestionStepRenderer } from "@/components/student/steps/question-step-renderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notifySubmitRewards } from "@/lib/proficiency-toast";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
} from "lucide-react";

type Props = {
  questions: DailyChallengeQuestionView[];
  totalCount: number;
  isComplete: boolean;
  pointReward: number;
};

export function DailyChallengeFlow({
  questions,
  totalCount,
  isComplete,
  pointReward,
}: Props) {
  const router = useRouter();
  const firstOpenIndex = useMemo(() => {
    const idx = questions.findIndex((q) => !q.isAnswered);
    return idx >= 0 ? idx : 0;
  }, [questions]);

  const [currentIndex, setCurrentIndex] = useState(firstOpenIndex);
  const [localAnswered, setLocalAnswered] = useState<Set<number>>(
    () => new Set(questions.filter((q) => q.isAnswered).map((q) => q.assignmentId))
  );

  const current = questions[currentIndex];
  const progressPercent =
    totalCount > 0 ? Math.round((localAnswered.size / totalCount) * 100) : 0;

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
        {labels.challenges.dailyNoQuestions}
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-8 text-center">
        <Trophy className="mx-auto size-12 text-success" />
        <h2 className="mt-4 text-xl font-bold">{labels.challenges.dailyDoneTitle}</h2>
        <p className="mt-2 text-muted-foreground">
          {labels.challenges.dailyDoneHint(pointReward)}
        </p>
      </div>
    );
  }

  async function handleAnswered(assignmentId: number) {
    setLocalAnswered((prev) => new Set(prev).add(assignmentId));
    router.refresh();

    const nextIndex = questions.findIndex(
      (q, index) => index > currentIndex && !localAnswered.has(q.assignmentId) && q.assignmentId !== assignmentId
    );
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
    } else if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {labels.challenges.dailyProgress}
            </p>
            <p className="text-lg font-bold">
              {localAnswered.size}/{totalCount} {labels.challenges.dailyQuestionsDone}
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="size-3.5 text-points" />
            +{pointReward} {labels.ranking.pts}
          </Badge>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={question.assignmentId}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
              index === currentIndex
                ? "border-primary bg-primary/10 text-primary"
                : localAnswered.has(question.assignmentId) || question.isAnswered
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {current && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{current.groupTitle}</Badge>
            <span>
              {labels.challenges.dailyQuestionOf(currentIndex + 1, questions.length)}
            </span>
          </div>

          {current.isAnswered || localAnswered.has(current.assignmentId) ? (
            <p className="text-sm text-success">
              {labels.challenges.dailyAlreadyAnswered}
            </p>
          ) : (
            <DailyQuestionStep
              question={current}
              onAnswered={() => handleAnswered(current.assignmentId)}
            />
          )}
        </div>
      )}

      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="gap-2"
        >
          <ChevronLeft className="size-4" />
          {labels.student.previous}
        </Button>
        <Button
          variant="outline"
          disabled={currentIndex >= questions.length - 1}
          onClick={() => setCurrentIndex((i) => i + 1)}
          className="gap-2"
        >
          {labels.student.next}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function DailyQuestionStep({
  question,
  onAnswered,
}: {
  question: DailyChallengeQuestionView;
  onAnswered: () => void;
}) {
  const router = useRouter();

  async function submitAnswer(answer: string, scorePercent?: number) {
    const result = await submitDailyChallengeAnswer(
      question.assignmentId,
      answer,
      scorePercent
    );
    notifySubmitRewards(result, () => router.refresh());
    onAnswered();
    return result;
  }

  return (
    <QuestionStepRenderer
      question={{
        contentItemId: question.contentItemId,
        subQuestionIndex: question.subQuestionIndex,
        questionText: question.questionText,
        skill: question.skill,
        format: question.format,
        options: question.options,
        expectedSpeech: question.expectedSpeech,
        correctAnswer: question.correctAnswer,
        audioUrl: question.audioUrl,
        essayRubric: question.essayRubric,
      }}
      onAnswered={onAnswered}
      submitAnswer={submitAnswer}
    />
  );
}
