"use server";

import { revalidateTag } from "next/cache";
import { ContentItemType, PointEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { computeAndSaveBadges } from "@/actions/student/badges";
import { awardPoints } from "@/lib/point-service";
import {
  buildGroupCompleteKey,
  buildMaterialKey,
  buildOnTimeKey,
  POINT_VALUES,
} from "@/lib/points";
import {
  recordChallengeEvent,
  type ChallengeCompletionResult,
} from "@/lib/challenge-service";
import {
  evaluateAfterGroupComplete,
  type AchievementGrantResult,
} from "@/lib/achievement-engine";
import { revalidateStudentGamification } from "@/lib/revalidate-student";

function revalidateLearnPaths(userId: number, levelId: number, groupId: number) {
  revalidateStudentGamification(userId);
  revalidateTag(`student:${userId}:learn:${levelId}:${groupId}`);
}

export async function updateLastContentItem(
  groupId: number,
  contentItemId: number,
  _levelId: number
) {
  const session = await requireStudent();
  const userId = getUserId(session);

  await prisma.userProgress.upsert({
    where: { userId_groupId: { userId, groupId } },
    create: {
      userId,
      groupId,
      lastContentItemId: contentItemId,
    },
    update: { lastContentItemId: contentItemId },
  });
  // Client owns step index; avoid forcing RSC re-render of the heavy learn tree.
}

export async function completeMaterial(
  contentItemId: number,
  groupId: number,
  levelId: number
) {
  const session = await requireStudent();
  const userId = getUserId(session);

  const item = await prisma.groupContentItem.findFirst({
    where: {
      id: contentItemId,
      groupId,
      type: ContentItemType.MATERIAL,
      group: { levelId, isPublished: true },
    },
    select: { id: true },
  });

  if (!item) {
    throw new Error("Material not found.");
  }

  const result = await awardPoints({
    userId,
    eventType: PointEventType.MATERIAL_COMPLETE,
    eventKey: buildMaterialKey(contentItemId),
    points: POINT_VALUES.MATERIAL_COMPLETE,
    metadata: { contentItemId, groupId },
  });

  let challengeCompletions: ChallengeCompletionResult[] = [];
  if (result.awarded > 0) {
    challengeCompletions = await recordChallengeEvent(userId, {
      kind: "MATERIAL_COMPLETE",
    });
  }

  revalidateLearnPaths(userId, levelId, groupId);

  return {
    pointsAwarded: result.awarded,
    totalPoints: result.totalPoints,
    challengeCompletions,
  };
}

export async function markGroupCompleted(groupId: number, levelId: number) {
  const session = await requireStudent();
  const userId = getUserId(session);

  const existingProgress = await prisma.userProgress.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: { isGroupCompleted: true },
  });

  if (existingProgress?.isGroupCompleted) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });
    return {
      pointsAdded: 0,
      onTimeBonus: 0,
      alreadyCompleted: true,
      newBadges: [],
      achievementGrants: [],
      totalPoints: user?.points ?? 0,
    };
  }

  const group = await prisma.learningGroup.findFirst({
    where: { id: groupId, levelId, isPublished: true },
    select: { dueAt: true },
  });

  if (!group) {
    throw new Error("Group not found.");
  }

  const now = new Date();
  let pointsAdded = 0;
  let onTimeBonus = 0;

  const completeAward = await awardPoints({
    userId,
    eventType: PointEventType.GROUP_COMPLETE,
    eventKey: buildGroupCompleteKey(groupId),
    points: POINT_VALUES.GROUP_COMPLETE,
    metadata: { groupId },
  });
  pointsAdded += completeAward.awarded;

  if (group.dueAt && now <= group.dueAt) {
    const onTimeAward = await awardPoints({
      userId,
      eventType: PointEventType.ON_TIME_BONUS,
      eventKey: buildOnTimeKey(groupId),
      points: POINT_VALUES.ON_TIME_BONUS,
      metadata: { groupId, dueAt: group.dueAt.toISOString() },
    });
    onTimeBonus = onTimeAward.awarded;
    pointsAdded += onTimeAward.awarded;
  }

  await prisma.userProgress.upsert({
    where: { userId_groupId: { userId, groupId } },
    create: {
      userId,
      groupId,
      isGroupCompleted: true,
      completedAt: now,
    },
    update: {
      isGroupCompleted: true,
      completedAt: now,
    },
  });

  const newBadges = await computeAndSaveBadges();
  const achievementGrants = await evaluateAfterGroupComplete(
    userId,
    levelId,
    groupId
  );
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true },
  });

  const challengeCompletions = await recordChallengeEvent(userId, {
    kind: "GROUP_COMPLETE",
  });

  revalidateLearnPaths(userId, levelId, groupId);

  return {
    pointsAdded,
    onTimeBonus,
    alreadyCompleted: false,
    newBadges,
    achievementGrants,
    totalPoints: user?.points ?? 0,
    challengeCompletions,
  };
}
