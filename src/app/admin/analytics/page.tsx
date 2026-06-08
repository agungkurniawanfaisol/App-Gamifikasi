import { fetchAdminAnalytics } from "@/actions/admin/analytics";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function AdminAnalyticsPage() {
  const data = await fetchAdminAnalytics();

  return (
    <div className="space-y-6">
      <PageHeader
        title={labels.admin.analyticsTitle}
        description={labels.admin.analyticsDescription}
      />
      <AnalyticsDashboard data={data} />
    </div>
  );
}
