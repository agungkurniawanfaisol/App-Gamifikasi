import { PointEventType } from "@prisma/client";

export const POINT_VALUES = {
  MATERIAL_COMPLETE: 5,
  CORRECT_ANSWER: 5,
  ON_TIME_BONUS: 25,
  DISCUSSION_MILESTONE: 3,
  GROUP_COMPLETE: 10,
} as const;

export const DISCUSSION_MESSAGES_PER_MILESTONE = 3;
export const DISCUSSION_MAX_MILESTONES_PER_DAY = 5;

export function buildMaterialKey(contentItemId: number): string {
  return `material:${contentItemId}`;
}

export function buildAnswerKey(
  contentItemId: number,
  subQuestionIndex: number
): string {
  return `answer:${contentItemId}:${subQuestionIndex}`;
}

export function buildOnTimeKey(groupId: number): string {
  return `on-time:${groupId}`;
}

export function buildGroupCompleteKey(groupId: number): string {
  return `group-complete:${groupId}`;
}

export function buildDiscussionKey(
  groupId: number | null,
  dateStr: string,
  milestone: number
): string {
  const scope = groupId ?? 0;
  return `discussion:${scope}:${dateStr}:${milestone}`;
}

export function buildProficiencyLevelKey(levelName: string): string {
  return `proficiency-level:${levelName}`;
}

export function buildAchievementBonusKey(achievementSlug: string): string {
  return `achievement:${achievementSlug}`;
}

export type PointAwardMeta = {
  eventType: PointEventType;
  eventKey: string;
  points: number;
};
