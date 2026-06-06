"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { labels } from "@/lib/labels";
import type { SubmitAnswerHandler } from "@/lib/submit-answer";
import { SpeakingStepClient } from "@/components/student/steps/speaking-step-client";

type SpeakingStepProps = {
  contentItemId: number;
  questionText: string;
  expectedSpeech: string;
  subQuestionIndex?: number;
  onAnswered: (correct: boolean) => void;
  submitAnswer?: SubmitAnswerHandler;
};

function SpeakingStepPlaceholder({
  questionText,
  expectedSpeech,
}: Pick<SpeakingStepProps, "questionText" | "expectedSpeech">) {
  const phraseToMatch = expectedSpeech.trim() || "your answer";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium leading-relaxed">{questionText}</p>

      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {labels.student.speechSayPhrase}
        </p>
        <p className="text-base font-medium text-primary">
          <Volume2 className="mr-2 inline size-4" />
          &ldquo;{phraseToMatch}&rdquo;
        </p>
      </div>

      <div className="flex justify-center py-4">
        <div
          className="size-20 animate-pulse rounded-full bg-muted"
          aria-hidden="true"
        />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {labels.student.speechTapMic}
      </p>
    </div>
  );
}

export function SpeakingStep(props: SpeakingStepProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SpeakingStepPlaceholder
        questionText={props.questionText}
        expectedSpeech={props.expectedSpeech}
      />
    );
  }

  return <SpeakingStepClient {...props} />;
}
