"use client";

import { QuestionFormat, QuestionSkill } from "@prisma/client";
import { EssayStep } from "@/components/student/steps/essay-step";
import { ListeningStep } from "@/components/student/steps/listening-step";
import { McqStep } from "@/components/student/steps/mcq-step";
import { SpeakingStep } from "@/components/student/steps/speaking-step";
import { YesNoStep } from "@/components/student/steps/yes-no-step";
import { getExpectedSpeech, isSpeakingQuestion } from "@/lib/speaking-question";
import type { SubmitAnswerHandler } from "@/lib/submit-answer";
import { labels } from "@/lib/labels";

export type QuestionStepInput = {
  contentItemId: number;
  subQuestionIndex: number;
  questionText: string;
  skill?: QuestionSkill | string | null;
  format: QuestionFormat;
  options?: string[] | null;
  expectedSpeech?: string | null;
  correctAnswer?: string | null;
  audioUrl?: string | null;
  essayRubric?: string | null;
};

type Props = {
  question: QuestionStepInput;
  onAnswered: () => void;
  submitAnswer?: SubmitAnswerHandler;
  initiallyAnswered?: boolean;
};

export function QuestionStepRenderer({
  question,
  onAnswered,
  submitAnswer,
  initiallyAnswered = false,
}: Props) {
  const speakingInput = {
    skill: question.skill,
    format: question.format,
    questionText: question.questionText,
    expectedSpeech: question.expectedSpeech,
    correctAnswer: question.correctAnswer,
  };

  if (isSpeakingQuestion(speakingInput)) {
    const expectedSpeech = getExpectedSpeech(speakingInput);
    return (
      <SpeakingStep
        contentItemId={question.contentItemId}
        questionText={question.questionText}
        expectedSpeech={expectedSpeech}
        subQuestionIndex={question.subQuestionIndex}
        onAnswered={() => onAnswered()}
        submitAnswer={submitAnswer}
      />
    );
  }

  if (question.format === QuestionFormat.ESSAY) {
    return (
      <EssayStep
        contentItemId={question.contentItemId}
        questionText={question.questionText}
        essayRubric={question.essayRubric ?? undefined}
        subQuestionIndex={question.subQuestionIndex}
        initiallyAnswered={initiallyAnswered}
        onAnswered={onAnswered}
        submitAnswer={submitAnswer}
      />
    );
  }

  if (question.format === QuestionFormat.YES_NO) {
    return (
      <YesNoStep
        contentItemId={question.contentItemId}
        questionText={question.questionText}
        subQuestionIndex={question.subQuestionIndex}
        onAnswered={() => onAnswered()}
        submitAnswer={submitAnswer}
      />
    );
  }

  if (
    question.skill === QuestionSkill.LISTENING ||
    (question.audioUrl && question.format === QuestionFormat.MULTIPLE_CHOICE)
  ) {
    return (
      <ListeningStep
        contentItemId={question.contentItemId}
        questionText={question.questionText}
        options={question.options ?? []}
        audioUrl={question.audioUrl ?? null}
        subQuestionIndex={question.subQuestionIndex}
        onAnswered={() => onAnswered()}
        submitAnswer={submitAnswer}
      />
    );
  }

  if (question.format === QuestionFormat.MULTIPLE_CHOICE) {
    return (
      <McqStep
        contentItemId={question.contentItemId}
        questionText={question.questionText}
        options={question.options ?? []}
        subQuestionIndex={question.subQuestionIndex}
        onAnswered={() => onAnswered()}
        submitAnswer={submitAnswer}
      />
    );
  }

  return (
    <p className="text-muted-foreground">{labels.challenges.dailyUnsupportedFormat}</p>
  );
}
