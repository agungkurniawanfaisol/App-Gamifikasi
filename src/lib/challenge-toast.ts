"use client";

import { toast } from "sonner";
import { labels } from "@/lib/labels";
import type { ChallengeCompletionResult } from "@/lib/challenge-service";

export function showChallengeCompleted(
  result: ChallengeCompletionResult
): void {
  if (result.pointsAwarded <= 0) return;
  toast.success(labels.challenges.completed(result.challengeTitle), {
    description: labels.challenges.completedHint(result.pointsAwarded),
    duration: 4500,
  });
}

export function notifyChallengeCompletions(
  completions: ChallengeCompletionResult[]
): void {
  for (const completion of completions) {
    showChallengeCompleted(completion);
  }
}
