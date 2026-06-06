import { QuestionFormat, QuestionSkill } from "@prisma/client";
import { getSkillLabel } from "@/lib/content-item";
import { getSubQuestionsFromItem } from "@/lib/sub-questions";
import type { ProficiencySummary } from "@/lib/proficiency-queries";

export const SKILL_ORDER: QuestionSkill[] = [
  QuestionSkill.SPEAKING,
  QuestionSkill.READING,
  QuestionSkill.WRITING,
  QuestionSkill.LISTENING,
];

export type SkillSlot = {
  contentItemId: number;
  subQuestionIndex: number;
  skill: QuestionSkill;
};

export type SkillProgressStat = {
  skill: QuestionSkill;
  label: string;
  attempted: number;
  total: number;
  correct: number;
  completionPercent: number;
  accuracyPercent: number | null;
};

export type MaterialProgressStat = {
  completed: number;
  total: number;
  percent: number;
};

export type LearningProgressSummary = {
  material: MaterialProgressStat;
  proficiency: ProficiencySummary;
  skills: SkillProgressStat[];
};

export function resolveSkillFromItem(
  item: {
    skill?: QuestionSkill | null;
    subQuestions?: unknown;
    questionText?: string | null;
    format?: QuestionFormat | null;
    options?: unknown;
    correctAnswer?: string | null;
    expectedSpeech?: string | null;
    audioUrl?: string | null;
    explanation?: string | null;
    essayRubric?: string | null;
    id?: number;
  },
  subQuestionIndex: number
): QuestionSkill | null {
  const subQuestions = getSubQuestionsFromItem(item);
  const sub = subQuestions[subQuestionIndex];
  if (sub?.skill) return sub.skill;
  return item.skill ?? null;
}

export function expandContentItemToSkillSlots(item: {
  id: number;
  type: string;
  skill?: QuestionSkill | null;
  subQuestions?: unknown;
  questionText?: string | null;
  format?: QuestionFormat | null;
  options?: unknown;
  correctAnswer?: string | null;
  expectedSpeech?: string | null;
  audioUrl?: string | null;
  explanation?: string | null;
  essayRubric?: string | null;
}): SkillSlot[] {
  if (item.type !== "QUESTION") return [];

  const subQuestions = getSubQuestionsFromItem(item);
  return subQuestions
    .map((sub, index) => ({
      contentItemId: item.id,
      subQuestionIndex: index,
      skill: sub.skill,
    }))
    .filter((slot) => SKILL_ORDER.includes(slot.skill));
}

export function buildAnswerKey(
  contentItemId: number,
  subQuestionIndex: number
): string {
  return `${contentItemId}:${subQuestionIndex}`;
}

export function computePercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export function buildSkillProgressStat(
  skill: QuestionSkill,
  attempted: number,
  total: number,
  correct: number
): SkillProgressStat {
  return {
    skill,
    label: getSkillLabel(skill),
    attempted,
    total,
    correct,
    completionPercent: computePercent(attempted, total),
    accuracyPercent:
      attempted > 0 ? computePercent(correct, attempted) : null,
  };
}

export function emptySkillStats(): SkillProgressStat[] {
  return SKILL_ORDER.map((skill) =>
    buildSkillProgressStat(skill, 0, 0, 0)
  );
}
