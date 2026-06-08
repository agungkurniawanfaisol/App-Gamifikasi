import { Suspense } from "react";
import {
  fetchTokenAuditPage,
  fetchTokenUsageChart,
  requireExternalApiTokenDetail,
} from "@/actions/admin/api-tokens";
import { ApiTokenAuditDashboard } from "@/components/admin/api-token-audit-dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function AdminApiTokenAuditPage({
  params,
  searchParams,
}: {
  params: { tokenId: string };
  searchParams: { page?: string; days?: string };
}) {
  const tokenId = Number.parseInt(params.tokenId, 10);
  if (Number.isNaN(tokenId)) {
    return null;
  }

  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const days = searchParams.days === "30" ? 30 : 7;

  const [token, chartData, auditLogs] = await Promise.all([
    requireExternalApiTokenDetail(tokenId),
    fetchTokenUsageChart(tokenId, days),
    fetchTokenAuditPage({ tokenId, page }),
  ]);

  return (
    <>
      <PageHeader
        title={labels.admin.apiTokensAuditPageTitle}
        description={labels.admin.apiTokensAuditDescription}
      />
      <div className="mt-6">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
          <ApiTokenAuditDashboard
            token={token}
            chartData={chartData}
            auditLogs={auditLogs}
            days={days}
          />
        </Suspense>
      </div>
    </>
  );
}
