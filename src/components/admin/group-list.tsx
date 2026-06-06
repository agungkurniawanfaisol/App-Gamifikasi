"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ChevronDown,
  FolderOpen,
  Globe,
  GlobeLock,
  LayoutList,
  Pencil,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteGroup, togglePublishGroup } from "@/actions/admin/groups";
import type { ContentItemSummary } from "@/lib/content-item";
import {
  getContentItemDescription,
  getContentItemLabel,
} from "@/lib/content-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButtonTooltip } from "@/components/ui/icon-button-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export type GroupListEntry = {
  id: number;
  title: string;
  isPublished: boolean;
  _count: { materials: number; questions: number };
  contentItems: ContentItemSummary[];
};

export function GroupList({
  levelId,
  groups,
}: {
  levelId: number;
  groups: GroupListEntry[];
}) {
  if (groups.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title={labels.admin.noGroups}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <GroupListCard key={group.id} levelId={levelId} group={group} />
      ))}
    </div>
  );
}

function GroupListCard({
  levelId,
  group,
}: {
  levelId: number;
  group: GroupListEntry;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const itemCount = group.contentItems.length;

  return (
    <div className="surface-card-interactive overflow-hidden">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">{group.title}</h3>
            <Badge variant={group.isPublished ? "default" : "secondary"}>
              {group.isPublished
                ? labels.status.published
                : labels.status.draft}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {labels.admin.materialsCount(
              group._count.materials,
              group._count.questions
            )}
          </p>
        </div>
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <IconButtonTooltip label={labels.common.edit}>
            <Button asChild size="icon-sm" aria-label={labels.common.edit}>
              <Link href={`/admin/levels/${levelId}/groups/${group.id}/edit`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
          </IconButtonTooltip>

          <IconButtonTooltip
            label={
              group.isPublished ? labels.admin.unpublish : labels.admin.publish
            }
          >
            <Button
              type="button"
              size="icon-sm"
              variant={group.isPublished ? "secondary" : "outline"}
              disabled={pending}
              onClick={() =>
                startTransition(() => togglePublishGroup(group.id, levelId))
              }
              aria-label={
                group.isPublished ? labels.admin.unpublish : labels.admin.publish
              }
            >
              {group.isPublished ? (
                <GlobeLock className="size-4" />
              ) : (
                <Globe className="size-4" />
              )}
            </Button>
          </IconButtonTooltip>

          <IconButtonTooltip label={labels.common.delete}>
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              disabled={pending}
              onClick={() =>
                startTransition(() => deleteGroup(group.id, levelId))
              }
              aria-label={labels.common.delete}
            >
              <Trash2 className="size-4" />
            </Button>
          </IconButtonTooltip>
        </div>
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="border-t border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-label={
                    open ? labels.admin.hideContents : labels.admin.showContents
                  }
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 sm:px-6"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <LayoutList className="size-4" />
                    </span>
                    {itemCount > 0 && (
                      <Badge variant="secondary" className="font-mono text-xs">
                        {itemCount}
                      </Badge>
                    )}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      open && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {open ? labels.admin.hideContents : labels.admin.showContents}
            </TooltipContent>
          </Tooltip>

          <CollapsibleContent>
            <div className="border-t border-border bg-muted/20 px-6 py-4">
              {itemCount === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {labels.admin.groupContentsEmpty}
                </p>
              ) : (
                <ol className="flex flex-col gap-2">
                  {group.contentItems.map((item, index) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 rounded-md border border-border bg-background px-3 py-2.5"
                    >
                      <span className="mt-0.5 text-xs font-mono text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              item.type === "MATERIAL" ? "secondary" : "default"
                            }
                            className="shrink-0"
                          >
                            {item.type === "MATERIAL"
                              ? labels.admin.itemMaterial
                              : labels.admin.itemQuestion}
                          </Badge>
                          <span className="text-sm font-medium">
                            {getContentItemLabel(item)}
                          </span>
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {getContentItemDescription(item)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
