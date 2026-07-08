"use server";

import { revalidateStudentGamification } from "@/lib/revalidate-student";
import { PointEventType, UserChallengeStatus } from "@prisma/client";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { submitContentAnswer } from "@/actions/student/quiz";
import { awardPoints } from "@/lib/point-service";
import {
  buildChallengeRewardKey,
  DAILY_CHALLENGE_QUESTION_COUNT,
} from "@/lib/challenge";
import {
  getDailyChallengePeriod,
  getDailyChallengeQuestions,
} from "@/lib/daily-challenge-service";
import { prisma } from "@/lib/prisma";
import type { ChallengeCompletionResult } from "@/lib/challenge-service";

export async function fetchDailyChallenge() {
  const session = await requireStudent();
  const userId = getUserId(session);
  return getDailyChallengeQuestions(userId);
}

export async function submitDailyChallengeAnswer(
  assignmentId: number,
  answer: string,
  scorePercent?: number
) {
  const session = await requireStudent();
  const userId = getUserId(session);

  const period = await getDailyChallengePeriod(userId);
  if (!period) {
    throw new Error("Daily challenge unavailable.");
  }

  const assignment = await prisma.userDailyChallengeQuestion.findFirst({
    where: {
      id: assignmentId,
      userId,
      periodId: period.id,
    },
  });

  if (!assignment) {
    throw new Error("Question not found.");
  }

  if (assignment.isAnswered) {
    throw new Error("Question already answered.");
  }

  const result = await submitContentAnswer(
    assignment.contentItemId,
    answer,
    scorePercent,
    assignment.subQuestionIndex
  );

  await prisma.userDailyChallengeQuestion.update({
    where: { id: assignment.id },
    data: {
      isAnswered: true,
      isCorrect: result.isCorrect,
      answeredAt: new Date(),
    },
  });

  let challengeCompletions: ChallengeCompletionResult[] = [];

  const answeredCount = await prisma.userDailyChallengeQuestion.count({
    where: { userId, periodId: period.id, isAnswered: true },
  });

  if (answeredCount >= DAILY_CHALLENGE_QUESTION_COUNT) {
    const progress = await prisma.userChallengeProgress.upsert({
      where: { userId_periodId: { userId, periodId: period.id } },
      create: {
        userId,
        periodId: period.id,
        objectiveCounts: { "0": answeredCount },
        status: UserChallengeStatus.IN_PROGRESS,
      },
      update: {
        objectiveCounts: { "0": answeredCount },
      },
    });

    if (progress.status === UserChallengeStatus.IN_PROGRESS) {
      const now = new Date();
      const updated = await prisma.userChallengeProgress.updateMany({
        where: {
          id: progress.id,
          userId,
          status: UserChallengeStatus.IN_PROGRESS,
        },
        data: {
          status: UserChallengeStatus.COMPLETED,
          completedAt: now,
        },
      });

      if (updated.count > 0) {
        const award = await awardPoints({
          userId,
          eventType: PointEventType.CHALLENGE_REWARD,
          eventKey: buildChallengeRewardKey(period.id),
          points: period.template.pointReward,
          metadata: {
            periodId: period.id,
            challengeTitle: period.template.title,
          },
        });

        await prisma.userChallengeProgress.update({
          where: { id: progress.id },
          data: {
            status: UserChallengeStatus.REWARDED,
            rewardedAt: now,
          },
        });

        if (award.awarded > 0) {
          challengeCompletions = [
            {
              challengeTitle: period.template.title,
              pointsAwarded: award.awarded,
              totalPoints: award.totalPoints,
            },
          ];
        }
      }
    }
  } else {
    await prisma.userChallengeProgress.upsert({
      where: { userId_periodId: { userId, periodId: period.id } },
      create: {
        userId,
        periodId: period.id,
        objectiveCounts: { "0": answeredCount },
      },
      update: {
        objectiveCounts: { "0": answeredCount },
      },
    });
  }

  revalidateStudentGamification(userId);

  return {
    ...result,
    challengeCompletions,
  };
}
