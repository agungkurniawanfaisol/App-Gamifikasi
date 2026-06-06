import {
  QuestionFormat,
  QuestionSkill,
} from "@prisma/client";

export type SubQuestion = {
  id: string;
  order: number;
  skill: QuestionSkill;
  format: QuestionFormat;
  weightPercent: number;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  expectedSpeech?: string;
  audioUrl?: string;
  explanation?: string;
  essayRubric?: string;
};

export function createEmptySubQuestion(order = 0): SubQuestion {
  return {
    id: crypto.randomUUID(),
    order,
    skill: QuestionSkill.READING,
    format: QuestionFormat.MULTIPLE_CHOICE,
    weightPercent: 100,
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  };
}

export function parseSubQuestions(raw: unknown): SubQuestion[] {
  if (!raw || !Array.isArray(raw)) return [];

  const parsed: SubQuestion[] = [];
  raw.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") return;
    const sq = entry as Record<string, unknown>;
    const skill = sq.skill as QuestionSkill;
    const format = sq.format as QuestionFormat;
    if (!skill || !format) return;

    const options = Array.isArray(sq.options)
      ? sq.options.map(String)
      : format === QuestionFormat.YES_NO
        ? ["Yes", "No"]
        : format === QuestionFormat.MULTIPLE_CHOICE
          ? ["", "", "", ""]
          : undefined;

    parsed.push({
      id: String(sq.id ?? `sub-${index}`),
      order: Number(sq.order ?? index),
      skill,
      format,
      weightPercent: Number(sq.weightPercent ?? 0),
      questionText: String(sq.questionText ?? ""),
      options,
      correctAnswer: sq.correctAnswer ? String(sq.correctAnswer) : undefined,
      expectedSpeech: sq.expectedSpeech
        ? String(sq.expectedSpeech)
        : undefined,
      audioUrl: sq.audioUrl ? String(sq.audioUrl) : undefined,
      explanation: sq.explanation ? String(sq.explanation) : undefined,
      essayRubric: sq.essayRubric ? String(sq.essayRubric) : undefined,
    });
  });

  return parsed.sort((a, b) => a.order - b.order);
}

export function getSubQuestionsFromItem(item: {
  subQuestions?: unknown;
  questionText?: string | null;
  skill?: QuestionSkill | null;
  format?: QuestionFormat | null;
  options?: unknown;
  correctAnswer?: string | null;
  expectedSpeech?: string | null;
  audioUrl?: string | null;
  explanation?: string | null;
  essayRubric?: string | null;
  id?: number;
}): SubQuestion[] {
  const parsed = parseSubQuestions(item.subQuestions);
  if (parsed.length > 0) return parsed;

  if (item.skill && item.format) {
    const options = Array.isArray(item.options)
      ? item.options.map(String)
      : item.format === QuestionFormat.MULTIPLE_CHOICE
        ? ["", "", "", ""]
        : undefined;

    return [
      {
        id: item.id ? `legacy-${item.id}` : "legacy-0",
        order: 0,
        skill: item.skill,
        format: item.format,
        weightPercent: 100,
        questionText: item.questionText ?? "",
        options,
        correctAnswer: item.correctAnswer ?? undefined,
        expectedSpeech: item.expectedSpeech ?? undefined,
        audioUrl: item.audioUrl ?? undefined,
        explanation: item.explanation ?? undefined,
        essayRubric: item.essayRubric ?? undefined,
      },
    ];
  }

  return [];
}

export function getFormatsForSkill(skill: QuestionSkill): QuestionFormat[] {
  switch (skill) {
    case QuestionSkill.SPEAKING:
      return [
        QuestionFormat.SPEECH_RECOGNITION,
        QuestionFormat.ESSAY,
        QuestionFormat.MULTIPLE_CHOICE,
      ];
    case QuestionSkill.READING:
      return [
        QuestionFormat.MULTIPLE_CHOICE,
        QuestionFormat.YES_NO,
        QuestionFormat.ESSAY,
      ];
    case QuestionSkill.WRITING:
      return [
        QuestionFormat.ESSAY,
        QuestionFormat.MULTIPLE_CHOICE,
        QuestionFormat.YES_NO,
      ];
    case QuestionSkill.LISTENING:
      return [
        QuestionFormat.MULTIPLE_CHOICE,
        QuestionFormat.YES_NO,
        QuestionFormat.ESSAY,
      ];
    default:
      return [QuestionFormat.MULTIPLE_CHOICE];
  }
}

export function getTotalWeight(subQuestions: SubQuestion[]): number {
  return subQuestions.reduce((sum, sq) => sum + (sq.weightPercent || 0), 0);
}

export function validateSubQuestions(subQuestions: SubQuestion[]): string | null {
  if (subQuestions.length === 0) {
    return "At least one sub-question is required.";
  }

  const total = getTotalWeight(subQuestions);
  if (total !== 100) {
    return `Total weight must equal 100% (currently ${total}%).`;
  }

  for (let i = 0; i < subQuestions.length; i++) {
    const sq = subQuestions[i]!;
    const label = `Sub-question ${i + 1}`;

    if (!sq.questionText.trim()) {
      return `${label}: question text is required.`;
    }
    if (sq.weightPercent < 1 || sq.weightPercent > 100) {
      return `${label}: weight must be between 1 and 100.`;
    }
    if (!getFormatsForSkill(sq.skill).includes(sq.format)) {
      return `${label}: invalid format for selected skill.`;
    }
    if (
      sq.format === QuestionFormat.SPEECH_RECOGNITION &&
      sq.skill !== QuestionSkill.SPEAKING
    ) {
      return `${label}: speech recognition is only for Speaking.`;
    }
    if (
      sq.format === QuestionFormat.MULTIPLE_CHOICE &&
      (!sq.options || sq.options.filter((o) => o.trim()).length < 2)
    ) {
      return `${label}: at least 2 options required.`;
    }
    if (
      (sq.format === QuestionFormat.MULTIPLE_CHOICE ||
        sq.format === QuestionFormat.YES_NO) &&
      !sq.correctAnswer?.trim()
    ) {
      return `${label}: correct answer is required.`;
    }
    if (
      sq.format === QuestionFormat.SPEECH_RECOGNITION &&
      !sq.expectedSpeech?.trim()
    ) {
      return `${label}: expected speech is required.`;
    }
    if (sq.skill === QuestionSkill.LISTENING && !sq.audioUrl?.trim()) {
      return `${label}: audio file is required for Listening.`;
    }
  }

  return null;
}

export function serializeSubQuestionsForDb(
  subQuestions: SubQuestion[]
): SubQuestion[] {
  return subQuestions.map((sq, index) => ({
    ...sq,
    order: index,
    questionText: sq.questionText.trim(),
    options:
      sq.format === QuestionFormat.MULTIPLE_CHOICE
        ? (sq.options ?? []).map((o) => o.trim())
        : sq.format === QuestionFormat.YES_NO
          ? ["Yes", "No"]
          : undefined,
    correctAnswer:
      sq.format === QuestionFormat.MULTIPLE_CHOICE ||
      sq.format === QuestionFormat.YES_NO
        ? sq.correctAnswer?.trim()
        : undefined,
    expectedSpeech:
      sq.format === QuestionFormat.SPEECH_RECOGNITION
        ? sq.expectedSpeech?.trim()
        : undefined,
    audioUrl:
      sq.skill === QuestionSkill.LISTENING ? sq.audioUrl?.trim() : undefined,
    essayRubric:
      sq.format === QuestionFormat.ESSAY ? sq.essayRubric?.trim() : undefined,
    explanation: sq.explanation?.trim() || undefined,
  }));
}

export function mirrorFirstSubToLegacyFields(subQuestions: SubQuestion[]) {
  const first = subQuestions[0];
  if (!first) {
    return {
      questionText: null,
      skill: null,
      format: null,
      options: [],
      correctAnswer: null,
      expectedSpeech: null,
      audioUrl: null,
      explanation: null,
      essayRubric: null,
    };
  }

  return {
    questionText: first.questionText,
    skill: first.skill,
    format: first.format,
    options: first.options ?? [],
    correctAnswer: first.correctAnswer ?? null,
    expectedSpeech: first.expectedSpeech ?? null,
    audioUrl: first.audioUrl ?? null,
    explanation: first.explanation ?? null,
    essayRubric: first.essayRubric ?? null,
  };
}

export function getSubQuestionSummary(subQuestions: SubQuestion[]): string {
  if (subQuestions.length === 0) return "Question";
  const skills = Array.from(new Set(subQuestions.map((sq) => sq.skill)));
  const skillLabels = skills
    .map((s) => {
      switch (s) {
        case QuestionSkill.SPEAKING:
          return "Speaking";
        case QuestionSkill.READING:
          return "Reading";
        case QuestionSkill.WRITING:
          return "Writing";
        case QuestionSkill.LISTENING:
          return "Listening";
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("+");
  return `${subQuestions.length} sub-questions · ${skillLabels}`;
}

export function isItemFullyAnswered(
  subCount: number,
  answers: { subQuestionIndex: number }[]
): boolean {
  if (subCount === 0) return false;
  for (let i = 0; i < subCount; i++) {
    if (!answers.some((a) => a.subQuestionIndex === i)) return false;
  }
  return true;
}

export function computeItemScorePercent(
  subQuestions: SubQuestion[],
  answers: { subQuestionIndex: number; isCorrect: boolean; scorePercent: number | null }[]
): number {
  let total = 0;
  for (const sq of subQuestions) {
    const answer = answers.find((a) => a.subQuestionIndex === sq.order);
    if (!answer) continue;
    let subScore = 0;
    if (sq.format === QuestionFormat.SPEECH_RECOGNITION) {
      subScore = answer.scorePercent ?? 0;
    } else if (answer.isCorrect) {
      subScore = 100;
    }
    total += (sq.weightPercent * subScore) / 100;
  }
  return Math.round(total);
}
