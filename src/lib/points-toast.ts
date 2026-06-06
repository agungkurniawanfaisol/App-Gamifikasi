"use client";

import { toast } from "sonner";
import { labels } from "@/lib/labels";

export function showPointsEarned(points: number): void {
  if (points <= 0) return;
  toast.success(labels.points.earned(points), {
    description: labels.points.earnedHint,
    duration: 3500,
  });
}

export function notifyPointsResult(
  result: { pointsAwarded?: number },
  refresh?: () => void
): void {
  const points = result.pointsAwarded ?? 0;
  if (points <= 0) return;
  showPointsEarned(points);
  refresh?.();
}
