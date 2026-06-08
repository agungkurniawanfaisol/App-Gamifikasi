"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft } from "lucide-react";
import {
  updateExternalApiTokenDailyQuota,
  type ExternalApiTokenDetail,
} from "@/actions/admin/api-tokens";
import type { PaginatedAuditLogs, UsageChartPoint } from "@/lib/external-api-audit";
import { labels } from "@/lib/labels";
import { ApiTokenUsageChart } from "@/components/admin/api-token-usage-chart";
import { ApiTokenAuditLogTable } from "@/components/admin/api-token-audit-log-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormattedDateTime } from "@/components/ui/formatted-date-time";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListPagination } from "@/components/ui/list-pagination";
import { Progress } from "@/components/ui/progress";

export function ApiTokenAuditDashboard({
  token,
  chartData,
  auditLogs,
  days,
}: {
  token: ExternalApiTokenDetail;
  chartData: UsageChartPoint[];
  auditLogs: PaginatedAuditLogs;
  days: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function setDays(nextDays: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", String(nextDays));
    params.delete("page");
    router.push(`/admin/api-tokens/${token.id}/audit?${params.toString()}`);
  }

  function handleQuotaSave(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateExternalApiTokenDailyQuota(token.id, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const quotaPercent =
    token.dailyQuota != null && token.dailyQuota > 0
      ? Math.min(100, Math.round((token.dailyUsed / token.dailyQuota) * 100))
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
          <Link href="/admin/api-tokens">
            <ArrowLeft className="size-4" />
            {labels.admin.apiTokensBackToTokens}
          </Link>
        </Button>
        <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
          <Link href="/admin/api-tokens/audit">{labels.admin.apiTokensAllActivity}</Link>
        </Button>
      </div>

      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{token.name}</h2>
              {!token.isActive && (
                <Badge variant="outline">{labels.admin.userInactive}</Badge>
              )}
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {labels.admin.apiTokensPrefix}: {token.tokenPrefix}…
            </p>
            <div className="flex flex-wrap gap-1">
              {token.scopes.map((scope) => (
                <Badge key={scope} variant="secondary" className="text-xs capitalize">
                  {scope}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {labels.admin.apiTokensLastUsed}:{" "}
              {token.lastUsedAt ? (
                <FormattedDateTime value={token.lastUsedAt} />
              ) : (
                labels.admin.apiTokensNever
              )}
            </p>
          </div>

          <div className="w-full space-y-3 lg:max-w-sm">
            <p className="text-sm font-medium">{labels.admin.apiTokensUsageToday(token.dailyUsed, token.dailyQuota)}</p>
            {token.dailyQuota != null ? (
              <>
                <Progress value={quotaPercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {labels.admin.apiTokensQuotaRemaining(token.dailyRemaining ?? 0)}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                {labels.admin.apiTokensDailyQuotaUnlimited}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <form action={handleQuotaSave} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="dailyQuota">{labels.admin.apiTokensDailyQuota}</Label>
            <Input
              id="dailyQuota"
              name="dailyQuota"
              type="number"
              min={1}
              defaultValue={token.dailyQuota ?? ""}
              placeholder={labels.admin.apiTokensDailyQuotaPlaceholder}
              className="min-h-11"
            />
            <p className="text-xs text-muted-foreground">
              {labels.admin.apiTokensDailyQuotaHint}
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending} className="min-h-11 w-full sm:w-auto">
            {labels.admin.apiTokensDailyQuotaSave}
          </Button>
        </form>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold">{labels.admin.apiTokensUsageChartTitle}</h3>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant={days === 7 ? "default" : "outline"}
              className="min-h-11 w-full sm:w-auto"
              onClick={() => setDays(7)}
            >
              {labels.admin.apiTokensUsageChart7Days}
            </Button>
            <Button
              type="button"
              variant={days === 30 ? "default" : "outline"}
              className="min-h-11 w-full sm:w-auto"
              onClick={() => setDays(30)}
            >
              {labels.admin.apiTokensUsageChart30Days}
            </Button>
          </div>
        </div>
        <ApiTokenUsageChart data={chartData} />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">{labels.admin.apiTokensAuditTitle}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {labels.admin.apiTokensTimezoneNote}
          </p>
        </div>
        <ApiTokenAuditLogTable logs={auditLogs.items} showToken={false} />
        <ListPagination
          page={auditLogs.page}
          totalPages={auditLogs.totalPages}
          total={auditLogs.total}
          pageSize={auditLogs.pageSize}
          pathname={`/admin/api-tokens/${token.id}/audit`}
          searchParams={{
            ...(days !== 7 ? { days: String(days) } : {}),
          }}
        />
      </section>
    </div>
  );
}
