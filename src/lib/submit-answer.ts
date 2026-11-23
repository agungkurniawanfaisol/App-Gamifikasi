import type { ChallengeCompletionResult } from "@/lib/challenge-service";
import type { AchievementGrantResult } from "@/lib/achievement-engine";
import type { ProficiencyLevelUpPayload } from "@/lib/proficiency";
import { labels } from "@/lib/labels";

export type SubmitAnswerResult = {
  isCorrect: boolean;
  scorePercent?: number | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  pointsAwarded?: number;
  totalPoints?: number;
  proficiencyGained?: number;
  proficiencyScore?: number;
  levelUp?: ProficiencyLevelUpPayload | null;
  shouldCelebrateLevelUp?: boolean;
  challengeCompletions?: ChallengeCompletionResult[];
  achievementGrants?: AchievementGrantResult[];
};

export type SubmitAnswerHandler = (
  answer: string,
  scorePercent?: number
) => Promise<SubmitAnswerResult>;

/**
 * Submit via Route Handler so Next.js does not re-render the learn page RSC
 * tree as part of a Server Action flight (that surfaces as a production digest toast).
 */
export async function postSubmitContentAnswer(
  contentItemId: number,
  answer: string,
  scorePercent?: number,
  subQuestionIndex = 0
): Promise<SubmitAnswerResult> {
  const res = await fetch("/api/student/submit-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentItemId,
      answer,
      scorePercent,
      subQuestionIndex,
    }),
  });

  const data = (await res.json().catch(() => null)) as
    | (SubmitAnswerResult & { error?: string })
    | null;

  if (!res.ok) {
    throw new Error(
      data?.error || labels.student.answerSaveFailed
    );
  }

  if (!data || typeof data.isCorrect !== "boolean") {
    throw new Error(labels.student.answerSaveFailed);
  }

  return data;
}
