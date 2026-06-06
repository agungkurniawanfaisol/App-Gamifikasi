"use server";

import { revalidatePath } from "next/cache";
import {
  ContentItemType,
  PointEventType,
  QuestionFormat,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { getSubQuestionsFromItem } from "@/lib/content-item";
import { scoreSpeechMatch } from "@/lib/speech-score";
import { SPEECH_PASS_THRESHOLD } from "@/lib/content-item";
import { awardPoints } from "@/lib/point-service";
import { buildAnswerKey, POINT_VALUES } from "@/lib/points";
import { computeProficiencyGain } from "@/lib/proficiency";
import { addProficiencyScore } from "@/lib/proficiency-service";
import type { ProficiencyLevelUpPayload } from "@/lib/proficiency";
import {
  recordChallengeEvent,
  type ChallengeCompletionResult,
} from "@/lib/challenge-service";
import type { AchievementGrantResult } from "@/lib/achievement-engine";

export async function submitContentAnswer(
  contentItemId: number,
  answer: string,
  scorePercent?: number,
  subQuestionIndex = 0
) {
  const session = await requireStudent();
  const userId = getUserId(session);

  const item = await prisma.groupContentItem.findUnique({
    where: { id: contentItemId },
    include: { group: { select: { levelId: true } } },
  });
  if (!item || item.type !== ContentItemType.QUESTION) {
    throw new Error("Question not found");
  }

  const subQuestions = getSubQuestionsFromItem(item);
  const sub = subQuestions[subQuestionIndex];
  if (!sub) {
    throw new Error("Sub-question not found");
  }

  let isCorrect = false;
  let finalScore: number | null = null;

  if (sub.format === QuestionFormat.MULTIPLE_CHOICE) {
    isCorrect = answer === sub.correctAnswer;
  } else if (sub.format === QuestionFormat.YES_NO) {
    isCorrect = answer === sub.correctAnswer;
  } else if (
    sub.format === QuestionFormat.SPEECH_RECOGNITION &&
    sub.expectedSpeech
  ) {
    const result = scoreSpeechMatch(sub.expectedSpeech, answer);
    finalScore = result.percent;
    isCorrect = result.percent >= SPEECH_PASS_THRESHOLD;
  } else if (sub.format === QuestionFormat.ESSAY) {
    isCorrect = answer.trim().length > 0;
  }

  if (scorePercent !== undefined) {
    finalScore = scorePercent;
    isCorrect = scorePercent >= SPEECH_PASS_THRESHOLD;
  }

  const existing = await prisma.userAnswer.findFirst({
    where: { userId, contentItemId, subQuestionIndex },
  });

  let pointsAwarded = 0;
  let totalPoints = 0;
  let proficiencyGained = 0;
  let proficiencyScore = 0;
  let levelUp: ProficiencyLevelUpPayload | null = null;
  let shouldCelebrateLevelUp = false;
  let challengeCompletions: ChallengeCompletionResult[] = [];
  let achievementGrants: AchievementGrantResult[] = [];

  if (existing) {
    await prisma.userAnswer.update({
      where: { id: existing.id },
      data: { answer, isCorrect, scorePercent: finalScore },
    });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, proficiencyScore: true },
    });
    totalPoints = user?.points ?? 0;
    proficiencyScore = user?.proficiencyScore ?? 0;
  } else {
    await prisma.userAnswer.create({
      data: {
        userId,
        contentItemId,
        subQuestionIndex,
        answer,
        isCorrect,
        scorePercent: finalScore,
      },
    });

    if (isCorrect) {
      const award = await awardPoints({
        userId,
        eventType: PointEventType.CORRECT_ANSWER,
        eventKey: buildAnswerKey(contentItemId, subQuestionIndex),
        points: POINT_VALUES.CORRECT_ANSWER,
        metadata: { contentItemId, subQuestionIndex },
      });
      pointsAwarded = award.awarded;
      totalPoints = award.totalPoints;

      if (award.awarded > 0) {
        challengeCompletions = await recordChallengeEvent(userId, {
          kind: "CORRECT_ANSWER",
          skill: sub.skill ?? item.skill,
          format: sub.format,
        });
      }
    } else {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });
      totalPoints = user?.points ?? 0;
    }

    const profGain = computeProficiencyGain(isCorrect, finalScore);
    const profResult = await addProficiencyScore(userId, profGain);
    proficiencyGained = profResult.gained;
    proficiencyScore = profResult.proficiencyScore;
    shouldCelebrateLevelUp = profResult.shouldCelebrate;
    achievementGrants = profResult.achievementGrants;
    if (profResult.levelUp) {
      levelUp = {
        fromName: profResult.levelUp.from.name,
        toName: profResult.levelUp.to.name,
        toLabel: profResult.levelUp.to.label,
        toDescription: profResult.levelUp.to.description,
      };
    }
  }

  if (
    pointsAwarded > 0 ||
    proficiencyGained > 0 ||
    shouldCelebrateLevelUp ||
    challengeCompletions.length > 0 ||
    achievementGrants.length > 0
  ) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/ranking");
    revalidatePath("/dashboard/challenges");
    revalidatePath("/dashboard/rewards");
    revalidatePath(`/dashboard/learn/${item.group.levelId}/${item.groupId}`);
  }

  const showFeedback =
    sub.format === QuestionFormat.MULTIPLE_CHOICE ||
    sub.format === QuestionFormat.YES_NO;

  return {
    isCorrect,
    scorePercent: finalScore,
    correctAnswer: showFeedback ? (sub.correctAnswer ?? null) : null,
    explanation: showFeedback ? (sub.explanation ?? null) : null,
    pointsAwarded,
    totalPoints,
    proficiencyGained,
    proficiencyScore,
    levelUp,
    shouldCelebrateLevelUp,
    challengeCompletions,
    achievementGrants,
  };
}

export async function updateAnswerFeedback(
  contentItemId: number,
  userId: number,
  feedback: string,
  subQuestionIndex = 0
) {
  const existing = await prisma.userAnswer.findFirst({
    where: { userId, contentItemId, subQuestionIndex },
  });
  if (!existing) return;

  await prisma.userAnswer.update({
    where: { id: existing.id },
    data: { aiFeedback: feedback },
  });
}
