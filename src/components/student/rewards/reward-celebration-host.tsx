"use client";

import { useEffect, useState } from "react";
import type { AchievementGrantResult } from "@/lib/achievement-engine";
import { RewardCelebrationModal } from "@/components/student/rewards/reward-celebration-modal";
import { markAchievementsNotified } from "@/actions/student/rewards";

export const ACHIEVEMENT_GRANTS_EVENT = "achievement-grants";

export function AchievementRewardHost({ userId }: { userId: number }) {
  const [grants, setGrants] = useState<AchievementGrantResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<AchievementGrantResult[]>).detail;
      if (!detail?.length) return;
      setGrants(detail);
      setOpen(true);
    };

    window.addEventListener(ACHIEVEMENT_GRANTS_EVENT, handler);
    return () => window.removeEventListener(ACHIEVEMENT_GRANTS_EVENT, handler);
  }, []);

  async function handleClose() {
    setOpen(false);
    if (grants.length > 0) {
      await markAchievementsNotified(
        grants.map((grant) => grant.achievementId)
      );
    }
    setGrants([]);
  }

  return (
    <RewardCelebrationModal
      grants={grants}
      open={open}
      onClose={handleClose}
    />
  );
}

export function dispatchAchievementGrants(grants: AchievementGrantResult[]) {
  if (typeof window === "undefined" || grants.length === 0) return;
  window.dispatchEvent(
    new CustomEvent(ACHIEVEMENT_GRANTS_EVENT, { detail: grants })
  );
}
