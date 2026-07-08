import type { ContentItemPayload } from "@/lib/content-item";
import { getSubQuestionsFromItem, parseOptions } from "@/lib/content-item";
import { parseMaterialAttachments } from "@/lib/material-attachments";
import { prisma } from "@/lib/prisma";

type ContentItemRow = {
  id: number;
  groupId: number;
  type: ContentItemPayload["type"];
  order: number;
  title: string | null;
  content: string | null;
  questionText: string | null;
  skill: ContentItemPayload["skill"];
  format: ContentItemPayload["format"];
  options: unknown;
  correctAnswer: string | null;
  expectedSpeech: string | null;
  audioUrl: string | null;
  explanation: string | null;
  essayRubric: string | null;
  subQuestions: unknown;
  attachments?: unknown;
};

function mapContentItem(item: ContentItemRow): ContentItemPayload {
  const subQuestions = getSubQuestionsFromItem(item);
  return {
    id: item.id,
    groupId: item.groupId,
    type: item.type,
    order: item.order,
    title: item.title,
    content: item.content,
    questionText: item.questionText,
    skill: item.skill,
    format: item.format,
    options: parseOptions(item.options),
    correctAnswer: item.correctAnswer,
    expectedSpeech: item.expectedSpeech,
    audioUrl: item.audioUrl,
    explanation: item.explanation,
    essayRubric: item.essayRubric,
    subQuestions,
    attachments: parseMaterialAttachments(item.attachments),
  };
}

export async function getGroupContentItems(
  groupId: number,
  levelId: number
): Promise<ContentItemPayload[]> {
  // Stale Prisma client may omit `attachments` from typings; call untyped.
  const items = (await (prisma.groupContentItem.findMany as Function)({
    where: {
      groupId,
      group: { levelId },
    },
    orderBy: { order: "asc" },
    select: {
      id: true,
      groupId: true,
      type: true,
      order: true,
      title: true,
      content: true,
      questionText: true,
      skill: true,
      format: true,
      options: true,
      correctAnswer: true,
      expectedSpeech: true,
      audioUrl: true,
      explanation: true,
      essayRubric: true,
      subQuestions: true,
      attachments: true,
    },
  })) as ContentItemRow[];

  return items.map(mapContentItem);
}

export async function getGroupContentItem(
  itemId: number,
  groupId: number,
  levelId: number
): Promise<ContentItemPayload | null> {
  const item = (await prisma.groupContentItem.findFirst({
    where: { id: itemId, groupId, group: { levelId } },
  })) as unknown as ContentItemRow | null;
  if (!item) return null;

  return mapContentItem(item);
}
