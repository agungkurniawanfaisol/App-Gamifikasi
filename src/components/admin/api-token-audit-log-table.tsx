import Link from "next/link";
import type { AuditLogWithToken } from "@/lib/external-api-audit";
import { labels } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { FormattedDateTime } from "@/components/ui/formatted-date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity } from "lucide-react";

function statusVariant(code: number): "default" | "secondary" | "destructive" | "outline" {
  if (code >= 200 && code < 300) return "default";
  if (code === 429) return "secondary";
  if (code >= 400) return "destructive";
  return "outline";
}

export function ApiTokenAuditLogTable({
  logs,
  showToken,
}: {
  logs: AuditLogWithToken[];
  showToken: boolean;
}) {
  if (logs.length === 0) {
    return <EmptyState icon={Activity} title={labels.admin.apiTokensAuditEmpty} />;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {showToken && <th className="px-3 py-2">{labels.admin.apiTokensAuditTokenColumn}</th>}
              <th className="px-3 py-2">{labels.admin.apiTokensAuditEndpoint}</th>
              <th className="px-3 py-2">{labels.admin.apiTokensAuditStatus}</th>
              <th className="px-3 py-2">{labels.admin.apiTokensAuditIp}</th>
              <th className="px-3 py-2">{labels.admin.apiTokensAuditTime}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0">
                {showToken && (
                  <td className="px-3 py-3 align-top">
                    <Link
                      href={`/admin/api-tokens/${log.tokenId}/audit`}
                      className="font-medium hover:underline"
                    >
                      {log.tokenName}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">
                      {log.tokenPrefix}…
                    </p>
                  </td>
                )}
                <td className="px-3 py-3 font-mono text-xs">{log.method} {log.endpoint}</td>
                <td className="px-3 py-3">
                  <Badge variant={statusVariant(log.statusCode)}>{log.statusCode}</Badge>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{log.clientIp ?? "—"}</td>
                <td className="px-3 py-3 text-muted-foreground">
                  <FormattedDateTime value={log.createdAt} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {logs.map((log) => (
          <li key={log.id} className="rounded-lg border p-4">
            {showToken && (
              <div className="mb-2">
                <Link
                  href={`/admin/api-tokens/${log.tokenId}/audit`}
                  className="font-medium hover:underline"
                >
                  {log.tokenName}
                </Link>
                <p className="font-mono text-xs text-muted-foreground">{log.tokenPrefix}…</p>
              </div>
            )}
            <p className="font-mono text-xs">{log.method} {log.endpoint}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(log.statusCode)}>{log.statusCode}</Badge>
              <span className="text-xs text-muted-foreground">{log.clientIp ?? "—"}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <FormattedDateTime value={log.createdAt} />
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
