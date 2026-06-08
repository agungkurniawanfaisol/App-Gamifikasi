"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowLeft } from "lucide-react";
import type { PaginatedAuditLogs, UsageChartPoint } from "@/lib/external-api-audit";
import { labels } from "@/lib/labels";
import { ApiTokenUsageChart } from "@/components/admin/api-token-usage-chart";
import { ApiTokenAuditLogTable } from "@/components/admin/api-token-audit-log-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ListPagination } from "@/components/ui/list-pagination";

type TokenOption = {
  id: number;
  name: string;
  tokenPrefix: string;
};

export function ApiTokenGlobalAuditPanel({
  tokens,
  chartData,
  auditLogs,
  selectedTokenId,
  days,
}: {
  tokens: TokenOption[];
  chartData: UsageChartPoint[];
  auditLogs: PaginatedAuditLogs;
  selectedTokenId?: number;
  days: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(next: { tokenId?: number; days?: number; page?: number }) {
    const params = new URLSearchParams();
    const tokenId = next.tokenId ?? selectedTokenId;
    const nextDays = next.days ?? days;
    const page = next.page ?? 1;

    if (tokenId != null) params.set("tokenId", String(tokenId));
    if (nextDays !== 7) params.set("days", String(nextDays));
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    router.push(query ? `/admin/api-tokens/audit?${query}` : "/admin/api-tokens/audit");
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
        <Link href="/admin/api-tokens">
          <ArrowLeft className="size-4" />
          {labels.admin.apiTokensBackToTokens}
        </Link>
      </Button>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="token-filter">{labels.admin.apiTokensAuditFilterLabel}</Label>
          <select
            id="token-filter"
            className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={selectedTokenId ?? ""}
            disabled={pending}
            onChange={(event) => {
              startTransition(() => {
                const value = event.target.value;
                navigate({
                  tokenId: value ? Number.parseInt(value, 10) : undefined,
                  page: 1,
                });
              });
            }}
          >
            <option value="">{labels.admin.apiTokensAuditFilterAll}</option>
            {tokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.name} ({token.tokenPrefix}…)
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:items-end sm:justify-end">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant={days === 7 ? "default" : "outline"}
              className="min-h-11 w-full sm:w-auto"
              disabled={pending}
              onClick={() => startTransition(() => navigate({ days: 7, page: 1 }))}
            >
              {labels.admin.apiTokensUsageChart7Days}
            </Button>
            <Button
              type="button"
              variant={days === 30 ? "default" : "outline"}
              className="min-h-11 w-full sm:w-auto"
              disabled={pending}
              onClick={() => startTransition(() => navigate({ days: 30, page: 1 }))}
            >
              {labels.admin.apiTokensUsageChart30Days}
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold">{labels.admin.apiTokensUsageChartTitle}</h3>
        <ApiTokenUsageChart data={chartData} />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">{labels.admin.apiTokensAuditTitle}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {labels.admin.apiTokensTimezoneNote}
          </p>
        </div>
        <ApiTokenAuditLogTable logs={auditLogs.items} showToken />
        <ListPagination
          page={auditLogs.page}
          totalPages={auditLogs.totalPages}
          total={auditLogs.total}
          pageSize={auditLogs.pageSize}
          pathname="/admin/api-tokens/audit"
          searchParams={{
            ...(selectedTokenId != null ? { tokenId: String(selectedTokenId) } : {}),
            ...(days !== 7 ? { days: String(days) } : {}),
          }}
        />
      </section>
    </div>
  );
}
