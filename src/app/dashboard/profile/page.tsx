import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { getMyProfile } from "@/actions/profile";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProficiencyProfileSection } from "@/components/student/proficiency/proficiency-card";
import { LearningProgressSection } from "@/components/student/progress/learning-progress-section";
import { PageHeader } from "@/components/ui/page-header";
import { getProficiencySummary } from "@/lib/proficiency-queries";
import { getLearningProgressSummary } from "@/lib/skill-progress-queries";
import { labels } from "@/lib/labels";
import { UserCircle } from "lucide-react";

export default async function StudentProfilePage() {
  const session = await requireStudent();
  const userId = getUserId(session);
  const [profile, proficiencySummary, learningProgress] = await Promise.all([
    getMyProfile(),
    getProficiencySummary(userId),
    getLearningProgressSummary(userId),
  ]);

  return (
    <div className="animate-slide-up space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <UserCircle className="size-7 text-primary" />
            {labels.profile.title}
          </span>
        }
        description={labels.profile.subtitle}
      />
      <ProficiencyProfileSection summary={proficiencySummary} />
      <LearningProgressSection summary={learningProgress} />
      <ProfileForm profile={profile} />
    </div>
  );
}
