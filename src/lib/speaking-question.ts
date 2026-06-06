import { QuestionFormat, QuestionSkill } from "@prisma/client";
import type { SubQuestion } from "@/lib/sub-questions";

const SAY_PHRASE_PATTERN =
  /Say\s+['"]([^'"]+)['"]\s*(?:clearly\s*)?(?:into the microphone)?/i;
const MICROPHONE_PATTERN = /into the microphone/i;

export type SpeakingQuestionLike = {
  skill?: QuestionSkill | string | null;
  format?: QuestionFormat | string | null;
  questionText?: string | null;
  expectedSpeech?: string | null;
  correctAnswer?: string | null;
};

export function isSpeakingQuestion(input: SpeakingQuestionLike): boolean {
  if (input.format === QuestionFormat.SPEECH_RECOGNITION) {
    return true;
  }

  if (
    input.format === QuestionFormat.MULTIPLE_CHOICE ||
    input.format === QuestionFormat.YES_NO ||
    input.format === QuestionFormat.ESSAY
  ) {
    return false;
  }

  if (input.skill === QuestionSkill.SPEAKING) {
    return true;
  }

  const text = input.questionText ?? "";
  return MICROPHONE_PATTERN.test(text) || SAY_PHRASE_PATTERN.test(text);
}

export function getExpectedSpeech(input: SpeakingQuestionLike): string {
  if (input.expectedSpeech?.trim()) {
    return input.expectedSpeech.trim();
  }

  const text = input.questionText ?? "";
  const parsed = text.match(SAY_PHRASE_PATTERN);
  if (parsed?.[1]) {
    return parsed[1].trim();
  }

  if (input.correctAnswer?.trim()) {
    return input.correctAnswer.trim();
  }

  return "";
}

export function fromSubQuestion(sub: SubQuestion): SpeakingQuestionLike {
  return {
    skill: sub.skill,
    format: sub.format,
    questionText: sub.questionText,
    expectedSpeech: sub.expectedSpeech,
    correctAnswer: sub.correctAnswer,
  };
}
