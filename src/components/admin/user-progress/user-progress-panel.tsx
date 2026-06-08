import type { AdminUserProgressOverviewClient } from "@/lib/admin-user-progress";
import { UserLevelProgressAccordion } from "@/components/admin/user-progress/user-level-progress-accordion";
import { UserProgressHistory } from "@/components/admin/user-progress/user-progress-history";
import { UserProgressOverview } from "@/components/admin/user-progress/user-progress-overview";
import { UserProgressSkills } from "@/components/admin/user-progress/user-progress-skills";

export function UserProgressPanel({
  overview,
  userId,
}: {
  overview: AdminUserProgressOverviewClient;
  userId: number;
}) {
  return (
    <div className="space-y-6">
      <UserProgressOverview overview={overview} />
      <UserProgressHistory history={overview.history} userId={userId} />
      <UserProgressSkills summary={overview.summary} />
      <UserLevelProgressAccordion levels={overview.levels} userId={userId} />
    </div>
  );
}
