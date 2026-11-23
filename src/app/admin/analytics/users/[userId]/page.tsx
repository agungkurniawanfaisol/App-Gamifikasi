import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { getUserById } from "@/actions/admin/users";
import { requireAdmin } from "@/lib/auth-helpers";
import { getAdminUserProgressOverview } from "@/lib/admin-user-progress";
import { StudentAnswerReviewDetail } from "@/components/admin/student-answer-review-detail";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";
import { ArrowLeft } from "lucide-react";

export default async function AdminAnalyticsUserReviewPage({
  params,
}: {
  params: { userId: string };
}) {
  await requireAdmin();

  const userId = parseInt(params.userId, 10);
  if (Number.isNaN(userId)) notFound();

  const user = await getUserById(userId);
  if (!user || user.role !== Role.STUDENT) notFound();

  const overview = await getAdminUserProgressOverview(userId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        description={labels.admin.analyticsReviewDetailDescription(user.name)}
        className="print:hidden"
      >
        <Button asChild variant="outline" className="min-h-11 gap-2">
          <Link href="/admin/analytics?tab=review">
            <ArrowLeft className="size-4" />
            {labels.common.back}
          </Link>
        </Button>
      </PageHeader>

      <StudentAnswerReviewDetail
        studentName={user.name}
        studentEmail={user.email}
        overview={overview}
      />
    </div>
  );
}
