import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { getMyProfile } from "@/actions/profile";
import { StudentProfileWorkspace } from "@/components/student/profile/student-profile-workspace";
import { PageHeader } from "@/components/ui/page-header";
import {
  getCachedProficiencySummary,
  getCachedUserRankSummary,
} from "@/lib/cached-queries";
import { getLearningProgressSummary } from "@/lib/skill-progress-queries";
import { labels } from "@/lib/labels";
import { UserCircle } from "lucide-react";

export default async function StudentProfilePage() {
  const session = await requireStudent();
  const userId = getUserId(session);
  const [profile, proficiencySummary, learningProgress, rankSummary] =
    await Promise.all([
      getMyProfile(),
      getCachedProficiencySummary(userId),
      getLearningProgressSummary(userId),
      getCachedUserRankSummary(userId),
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

      <StudentProfileWorkspace
        profile={profile}
        proficiencySummary={proficiencySummary}
        rankSummary={rankSummary}
        learningProgress={learningProgress}
      />
    </div>
  );
}
