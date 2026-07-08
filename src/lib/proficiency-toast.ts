"use client";

import { toast } from "sonner";
import { labels } from "@/lib/labels";
import { notifyPointsResult } from "@/lib/points-toast";
import { notifyChallengeCompletions } from "@/lib/challenge-toast";
import { dispatchAchievementGrants } from "@/components/student/rewards/reward-celebration-host";
import type { AchievementGrantResult } from "@/lib/achievement-engine";
import type { ChallengeCompletionResult } from "@/lib/challenge-service";
import type { ProficiencyLevelUpPayload } from "@/lib/proficiency";

export function showProficiencyLevelUp(payload: ProficiencyLevelUpPayload): void {
  toast.success(labels.proficiency.levelUpTitle(payload.toLabel), {
    description: labels.proficiency.levelUpDescription(payload.toDescription),
    duration: 5000,
  });
}

export function notifyProficiencyResult(
  result: {
    levelUp?: ProficiencyLevelUpPayload | null;
    shouldCelebrateLevelUp?: boolean;
  },
  refresh?: () => void
): void {
  if (result.levelUp && result.shouldCelebrateLevelUp) {
    showProficiencyLevelUp(result.levelUp);
    refresh?.();
  }
}

export function notifyAchievementGrants(
  grants?: AchievementGrantResult[]
): void {
  if (!grants?.length) return;
  dispatchAchievementGrants(grants);
}

export function notifySubmitRewards(
  result: {
    pointsAwarded?: number;
    levelUp?: ProficiencyLevelUpPayload | null;
    shouldCelebrateLevelUp?: boolean;
    challengeCompletions?: ChallengeCompletionResult[];
    achievementGrants?: AchievementGrantResult[];
  },
  refresh?: () => void
): void {
  const shouldRefresh =
    Boolean(result.pointsAwarded && result.pointsAwarded > 0) ||
    Boolean(result.levelUp && result.shouldCelebrateLevelUp) ||
    Boolean(result.challengeCompletions?.length) ||
    Boolean(result.achievementGrants?.length);

  notifyPointsResult(result);
  notifyProficiencyResult(result);
  if (result.challengeCompletions?.length) {
    notifyChallengeCompletions(result.challengeCompletions);
  }
  if (result.achievementGrants?.length) {
    notifyAchievementGrants(result.achievementGrants);
  }
  if (shouldRefresh) refresh?.();
}

export function notifyProgressRewards(
  result: {
    pointsAwarded?: number;
    pointsAdded?: number;
    challengeCompletions?: ChallengeCompletionResult[];
    achievementGrants?: AchievementGrantResult[];
  },
  refresh?: () => void
): void {
  const points = result.pointsAwarded ?? result.pointsAdded ?? 0;
  const shouldRefresh =
    points > 0 ||
    Boolean(result.challengeCompletions?.length) ||
    Boolean(result.achievementGrants?.length);

  notifyPointsResult({ pointsAwarded: points });
  if (result.challengeCompletions?.length) {
    notifyChallengeCompletions(result.challengeCompletions);
  }
  if (result.achievementGrants?.length) {
    notifyAchievementGrants(result.achievementGrants);
  }
  if (shouldRefresh) refresh?.();
}
