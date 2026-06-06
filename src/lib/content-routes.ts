import { QuestionFormat, QuestionSkill } from "@prisma/client";

const SKILL_SLUGS: Record<string, QuestionSkill> = {
  speaking: QuestionSkill.SPEAKING,
  reading: QuestionSkill.READING,
  writing: QuestionSkill.WRITING,
  listening: QuestionSkill.LISTENING,
};

const FORMAT_SLUGS: Record<string, QuestionFormat> = {
  "multiple-choice": QuestionFormat.MULTIPLE_CHOICE,
  "yes-no": QuestionFormat.YES_NO,
  essay: QuestionFormat.ESSAY,
  "speech-recognition": QuestionFormat.SPEECH_RECOGNITION,
};

const SKILL_TO_SLUG: Record<QuestionSkill, string> = {
  [QuestionSkill.SPEAKING]: "speaking",
  [QuestionSkill.READING]: "reading",
  [QuestionSkill.WRITING]: "writing",
  [QuestionSkill.LISTENING]: "listening",
};

const FORMAT_TO_SLUG: Record<QuestionFormat, string> = {
  [QuestionFormat.MULTIPLE_CHOICE]: "multiple-choice",
  [QuestionFormat.YES_NO]: "yes-no",
  [QuestionFormat.ESSAY]: "essay",
  [QuestionFormat.SPEECH_RECOGNITION]: "speech-recognition",
};

export function groupEditPath(levelId: number, groupId: number): string {
  return `/admin/levels/${levelId}/groups/${groupId}/edit`;
}

export function newItemPath(levelId: number, groupId: number): string {
  return `${groupEditPath(levelId, groupId)}/items/new`;
}

export function newMaterialPath(levelId: number, groupId: number): string {
  return `${groupEditPath(levelId, groupId)}/items/new/material`;
}

export function newQuestionPath(levelId: number, groupId: number): string {
  return `${groupEditPath(levelId, groupId)}/items/new/question`;
}

export function newQuestionSkillPath(levelId: number, groupId: number): string {
  return newQuestionPath(levelId, groupId);
}

export function newQuestionFormatPath(
  levelId: number,
  groupId: number,
  skill: QuestionSkill
): string {
  return `${groupEditPath(levelId, groupId)}/items/new/question/${skillToSlug(skill)}`;
}

export function newQuestionFormPath(
  levelId: number,
  groupId: number,
  skill: QuestionSkill,
  format: QuestionFormat
): string {
  return `${groupEditPath(levelId, groupId)}/items/new/question/${skillToSlug(skill)}/${formatToSlug(format)}`;
}

export function editItemPath(
  levelId: number,
  groupId: number,
  itemId: number
): string {
  return `${groupEditPath(levelId, groupId)}/items/${itemId}`;
}

export function skillToSlug(skill: QuestionSkill): string {
  return SKILL_TO_SLUG[skill];
}

export function formatToSlug(format: QuestionFormat): string {
  return FORMAT_TO_SLUG[format];
}

export function parseSkillSlug(slug: string): QuestionSkill | null {
  return SKILL_SLUGS[slug.toLowerCase()] ?? null;
}

export function parseFormatSlug(slug: string): QuestionFormat | null {
  return FORMAT_SLUGS[slug.toLowerCase()] ?? null;
}
