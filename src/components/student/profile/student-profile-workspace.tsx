"use client";

import { useState } from "react";
import type { ProfileSummary } from "@/lib/user-profile";
import type { ProficiencySummary } from "@/lib/proficiency-queries";
import type { UserRankSummary } from "@/lib/ranking-queries";
import type { LearningProgressSummary } from "@/lib/skill-progress";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileHero } from "@/components/student/profile/profile-hero";
import { LearningProgressSection } from "@/components/student/progress/learning-progress-section";

type StudentProfileWorkspaceProps = {
  profile: ProfileSummary;
  proficiencySummary: ProficiencySummary;
  rankSummary: UserRankSummary | null;
  learningProgress: LearningProgressSummary;
};

export function StudentProfileWorkspace({
  profile,
  proficiencySummary,
  rankSummary,
  learningProgress,
}: StudentProfileWorkspaceProps) {
  const [imageUrl, setImageUrl] = useState(profile.profileImageUrl);

  return (
    <div className="space-y-6">
      <ProfileHero
        profile={{ ...profile, profileImageUrl: imageUrl }}
        proficiencySummary={proficiencySummary}
        rankSummary={rankSummary}
        onImageUrlChange={setImageUrl}
      />

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="order-1 lg:order-2 lg:col-span-7">
          <ProfileForm
            profile={profile}
            variant="student"
            imageUrl={imageUrl}
            onImageUrlChange={setImageUrl}
            hidePhotoSection
          />
        </div>

        <div className="order-2 lg:order-1 lg:col-span-5">
          <LearningProgressSection
            summary={learningProgress}
            hideProficiency
            hideHeader
          />
        </div>
      </div>
    </div>
  );
}
