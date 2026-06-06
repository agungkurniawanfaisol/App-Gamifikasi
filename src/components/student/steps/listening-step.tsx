"use client";

import { McqStep } from "@/components/student/steps/mcq-step";
import { labels } from "@/lib/labels";
import type { SubmitAnswerHandler } from "@/lib/submit-answer";

export function ListeningStep({
  contentItemId,
  questionText,
  options,
  audioUrl,
  subQuestionIndex = 0,
  onAnswered,
  submitAnswer,
}: {
  contentItemId: number;
  questionText: string;
  options: string[];
  audioUrl: string | null;
  subQuestionIndex?: number;
  onAnswered: (correct: boolean) => void;
  submitAnswer?: SubmitAnswerHandler;
}) {
  return (
    <div className="flex flex-col gap-4">
      {audioUrl && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{labels.student.listenAudio}</p>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
      <McqStep
        contentItemId={contentItemId}
        questionText={questionText}
        options={options}
        subQuestionIndex={subQuestionIndex}
        onAnswered={onAnswered}
        submitAnswer={submitAnswer}
      />
    </div>
  );
}
