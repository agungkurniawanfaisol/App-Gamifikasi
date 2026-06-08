import type { AdminUserProgressOverviewClient } from "@/lib/admin-user-progress";
import { UserFeedbackList } from "@/components/admin/user-progress/user-feedback-list";

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
    <UserFeedbackList
      items={overview.feedbackItems}
      initialFeedbackId={initialFeedbackId}
      initialGroupId={initialGroupId}
    />
  );
}
