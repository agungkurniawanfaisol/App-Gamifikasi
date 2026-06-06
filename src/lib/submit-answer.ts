import type { ChallengeCompletionResult } from "@/lib/challenge-service";
import type { AchievementGrantResult } from "@/lib/achievement-engine";
import type { ProficiencyLevelUpPayload } from "@/lib/proficiency";

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
