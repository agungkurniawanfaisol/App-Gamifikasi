import {
  fetchTokenAuditPage,
  fetchTokenUsageChart,
  listExternalApiTokenOptions,
} from "@/actions/admin/api-tokens";
import { ApiTokenGlobalAuditPanel } from "@/components/admin/api-token-global-audit-panel";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function AdminApiTokensGlobalAuditPage({
  searchParams,
}: {
  searchParams: { page?: string; days?: string; tokenId?: string };
}) {
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const days = searchParams.days === "30" ? 30 : 7;
  const tokenIdRaw = searchParams.tokenId?.trim();
  const selectedTokenId =
    tokenIdRaw && /^\d+$/.test(tokenIdRaw) ? Number.parseInt(tokenIdRaw, 10) : undefined;

  const [tokens, chartData, auditLogs] = await Promise.all([
    listExternalApiTokenOptions(),
    fetchTokenUsageChart(selectedTokenId, days),
    fetchTokenAuditPage({ tokenId: selectedTokenId, page }),
  ]);

  return (
    <>
      <PageHeader
        title={labels.admin.apiTokensAllActivityTitle}
        description={labels.admin.apiTokensAllActivityDescription}
      />
      <div className="mt-6">
        <ApiTokenGlobalAuditPanel
          tokens={tokens}
          chartData={chartData}
          auditLogs={auditLogs}
          selectedTokenId={selectedTokenId}
          days={days}
        />
      </div>
    </>
  );
}
