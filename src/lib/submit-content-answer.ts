import {
  ContentItemType,
  PointEventType,
  QuestionFormat,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
import { canAccessGroup } from "@/lib/progression";
import { revalidateStudentGamification } from "@/lib/revalidate-student";
import type { SubmitAnswerResult } from "@/lib/submit-answer";

export class SubmitContentAnswerError extends Error {
  constructor(
    message: string,
    readonly status: number = 400
  ) {
    super(message);
    this.name = "SubmitContentAnswerError";
  }
}

/**
 * Persist a content answer and apply first-attempt rewards.
 * Safe to call from Route Handlers (preferred on learn pages) so Next.js
 * does not auto-refresh the heavy learn RSC tree mid-submit.
 */
export async function executeSubmitContentAnswer(
  userId: number,
  contentItemId: number,
  answer: string,
  scorePercent?: number,
  subQuestionIndex = 0
): Promise<SubmitAnswerResult> {
  const item = await prisma.groupContentItem.findUnique({
    where: { id: contentItemId },
    include: {
      group: {
        select: { id: true, levelId: true, isPublished: true },
      },
    },
  });
  if (!item || item.type !== ContentItemType.QUESTION) {
    throw new SubmitContentAnswerError("Question not found", 404);
  }

  if (!item.group.isPublished) {
    throw new SubmitContentAnswerError("Question not found", 404);
  }

  const allowed = await canAccessGroup(
    userId,
    item.group.id,
    item.group.levelId
  );
  if (!allowed) {
    throw new SubmitContentAnswerError("Forbidden", 403);
  }

  const subQuestions = getSubQuestionsFromItem(item);
  const sub = subQuestions[subQuestionIndex];
  if (!sub) {
    throw new SubmitContentAnswerError("Sub-question not found", 404);
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
    // Always score speech on the server; client scorePercent is ignored.
    const result = scoreSpeechMatch(sub.expectedSpeech, answer);
    finalScore = result.percent;
    isCorrect = result.percent >= SPEECH_PASS_THRESHOLD;
  } else if (sub.format === QuestionFormat.ESSAY) {
    isCorrect = answer.trim().length > 0;
  }

  // Client-supplied scorePercent must not override server grading for any format.
  void scorePercent;

  const existing = await prisma.userAnswer.findUnique({
    where: {
      userId_contentItemId_subQuestionIndex: {
        userId,
        contentItemId,
        subQuestionIndex,
      },
    },
    select: { id: true },
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
      where: {
        userId_contentItemId_subQuestionIndex: {
          userId,
          contentItemId,
          subQuestionIndex,
        },
      },
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

    try {
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
    } catch (error) {
      console.error("[submit-content-answer] reward side-effect failed", {
        userId,
        contentItemId,
        subQuestionIndex,
        error,
      });
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true, proficiencyScore: true },
      });
      totalPoints = user?.points ?? totalPoints;
      proficiencyScore = user?.proficiencyScore ?? proficiencyScore;
    }
  }

  if (
    pointsAwarded > 0 ||
    proficiencyGained > 0 ||
    shouldCelebrateLevelUp ||
    challengeCompletions.length > 0 ||
    achievementGrants.length > 0
  ) {
    try {
      revalidateStudentGamification(userId);
    } catch (error) {
      console.error("[submit-content-answer] revalidate failed", {
        userId,
        error,
      });
    }
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
