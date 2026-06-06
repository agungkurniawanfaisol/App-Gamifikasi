import { ChatRole, PointEventType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildDiscussionKey,
  DISCUSSION_MAX_MILESTONES_PER_DAY,
  DISCUSSION_MESSAGES_PER_MILESTONE,
  POINT_VALUES,
} from "@/lib/points";

export type AwardResult = {
  awarded: number;
  totalPoints: number;
  alreadyAwarded: boolean;
};

type AwardInput = {
  userId: number;
  eventType: PointEventType;
  eventKey: string;
  points: number;
  metadata?: Prisma.InputJsonValue;
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function awardPoints(input: AwardInput): Promise<AwardResult> {
  try {
    const totalPoints = await prisma.$transaction(async (tx) => {
      await tx.userPointEvent.create({
        data: {
          userId: input.userId,
          eventType: input.eventType,
          eventKey: input.eventKey,
          points: input.points,
          metadata: input.metadata,
        },
      });

      const user = await tx.user.update({
        where: { id: input.userId },
        data: { points: { increment: input.points } },
        select: { points: true },
      });

      return user.points;
    });

    return {
      awarded: input.points,
      totalPoints,
      alreadyAwarded: false,
    };
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { points: true },
    });

    return {
      awarded: 0,
      totalPoints: user?.points ?? 0,
      alreadyAwarded: true,
    };
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function awardDiscussionMilestone(
  userId: number,
  groupId: number | null
): Promise<AwardResult> {
  const now = new Date();
  const dayStart = startOfUtcDay(now);
  const dateStr = utcDateKey(now);
  const scopeGroupId = groupId ?? null;

  const messageCount = await prisma.chatHistory.count({
    where: {
      userId,
      role: ChatRole.USER,
      groupId: scopeGroupId,
      createdAt: { gte: dayStart },
    },
  });

  const milestoneReached = Math.floor(
    messageCount / DISCUSSION_MESSAGES_PER_MILESTONE
  );
  if (milestoneReached === 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });
    return {
      awarded: 0,
      totalPoints: user?.points ?? 0,
      alreadyAwarded: false,
    };
  }

  const awardedToday = await prisma.userPointEvent.count({
    where: {
      userId,
      eventType: PointEventType.DISCUSSION_MILESTONE,
      eventKey: { startsWith: `discussion:${groupId ?? 0}:${dateStr}:` },
    },
  });

  if (awardedToday >= DISCUSSION_MAX_MILESTONES_PER_DAY) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });
    return {
      awarded: 0,
      totalPoints: user?.points ?? 0,
      alreadyAwarded: false,
    };
  }

  if (milestoneReached <= awardedToday) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });
    return {
      awarded: 0,
      totalPoints: user?.points ?? 0,
      alreadyAwarded: true,
    };
  }

  const nextMilestone = awardedToday + 1;

  return awardPoints({
    userId,
    eventType: PointEventType.DISCUSSION_MILESTONE,
    eventKey: buildDiscussionKey(groupId, dateStr, nextMilestone),
    points: POINT_VALUES.DISCUSSION_MILESTONE,
    metadata: {
      groupId,
      milestone: nextMilestone,
      messageCount,
    },
  });
}
