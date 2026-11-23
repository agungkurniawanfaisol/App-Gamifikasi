import type { AdminUserProgressOverviewClient } from "@/lib/admin-user-progress";
import { UserFeedbackList } from "@/components/admin/user-progress/user-feedback-list";
import { UserFeedbackReport } from "@/components/admin/user-progress/user-feedback-report";

export function UserFeedbackPanel({
  overview,
  initialFeedbackId,
  initialGroupId,
}: {
  overview: AdminUserProgressOverviewClient;
  initialFeedbackId?: string | null;
  initialGroupId?: number | null;
}) {
  return (
    <div className="space-y-6">
      <UserFeedbackReport overview={overview} />
      <UserFeedbackList
        items={overview.feedbackItems}
        initialFeedbackId={initialFeedbackId}
        initialGroupId={initialGroupId}
      />
    </div>
  );
}
