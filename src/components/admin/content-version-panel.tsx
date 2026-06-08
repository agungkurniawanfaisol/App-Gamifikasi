"use client";

import { useTransition } from "react";
import { History } from "lucide-react";
import type { getContentItemVersions } from "@/actions/admin/content-versions";
import { restoreContentItemVersion } from "@/actions/admin/content-versions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { labels } from "@/lib/labels";

type VersionRow = Awaited<ReturnType<typeof getContentItemVersions>>[number];

function formatDateTime(value: Date) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ContentVersionPanel({
  contentItemId,
  groupId,
  levelId,
  versions,
}: {
  contentItemId: number;
  groupId: number;
  levelId: number;
  versions: VersionRow[];
}) {
  const [pending, startTransition] = useTransition();

  if (versions.length === 0) {
    return (
      <EmptyState icon={History} title={labels.admin.versionEmpty} />
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {versions.map((version) => (
        <li
          key={version.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">
                {labels.admin.versionNumber(version.versionNumber)}
              </p>
              <Badge variant="outline">{formatDateTime(version.createdAt)}</Badge>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            disabled={pending}
            onClick={() =>
              startTransition(() =>
                restoreContentItemVersion(
                  version.id,
                  contentItemId,
                  groupId,
                  levelId
                )
              )
            }
          >
            {labels.admin.versionRestore}
          </Button>
        </li>
      ))}
    </ul>
  );
}
