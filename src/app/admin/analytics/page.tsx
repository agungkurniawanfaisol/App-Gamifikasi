import { Suspense } from "react";
import {
  fetchAdminAnalytics,
  fetchStudentAnswerReview,
} from "@/actions/admin/analytics";
import { AnalyticsTabs } from "@/components/admin/analytics-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams?: { tab?: string; page?: string; pageSize?: string };
}) {
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const pageSizeParam = searchParams?.pageSize;
  const pageSize =
    pageSizeParam === "all"
      ? 0
      : Math.max(1, parseInt(pageSizeParam ?? "50", 10) || 50);

  const [analytics, roster] = await Promise.all([
    fetchAdminAnalytics(),
    fetchStudentAnswerReview(page, pageSize),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={labels.admin.analyticsTitle}
        description={labels.admin.analyticsDescription}
        className="print:hidden"
      />
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}
      >
        <AnalyticsTabs analytics={analytics} roster={roster} />
      </Suspense>
    </div>
  );
}
