import type { ContentItemPayload } from "@/lib/content-item";
import { getSubQuestionsFromItem, parseOptions } from "@/lib/content-item";
import { parseMaterialAttachments } from "@/lib/material-attachments";
import { prisma } from "@/lib/prisma";

function mapContentItem(item: {
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
}): ContentItemPayload {
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
  const group = await prisma.learningGroup.findFirst({
    where: { id: groupId, levelId },
    include: { contentItems: { orderBy: { order: "asc" } } },
  });
  if (!group) return [];

  return group.contentItems.map(mapContentItem);
}

export async function getGroupContentItem(
  itemId: number,
  groupId: number,
  levelId: number
): Promise<ContentItemPayload | null> {
  const item = await prisma.groupContentItem.findFirst({
    where: { id: itemId, groupId, group: { levelId } },
  });
  if (!item) return null;

  return mapContentItem(item);
}
