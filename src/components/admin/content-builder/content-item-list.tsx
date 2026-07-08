"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  BookOpen,
  ChevronDown,
  HelpCircle,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useState } from "react";
import { deleteContentItem } from "@/actions/admin/content-items";
import type { ContentItemPayload } from "@/lib/content-item";
import { getContentItemLabel } from "@/lib/content-item";
import { editItemPath, newItemPath } from "@/lib/content-routes";
import { MaterialPreview } from "@/components/admin/content-builder/material-preview";
import { QuestionPreview } from "@/components/admin/content-builder/question-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconButtonTooltip } from "@/components/ui/icon-button-tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AiContentGenerator } from "@/components/admin/content-builder/ai-content-generator";
import { labels } from "@/lib/labels";

export function ContentItemList({
  levelId,
  groupId,
  items,
}: {
  levelId: number;
  groupId: number;
  items: ContentItemPayload[];
}) {
  const [pending, startTransition] = useTransition();
  const materialCount = items.filter((i) => i.type === "MATERIAL").length;
  const questionCount = items.filter((i) => i.type === "QUESTION").length;

  return (
    <div className="flex flex-col gap-6">
      <AiContentGenerator levelId={levelId} groupId={groupId} />

      <div className="surface-elevated flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 font-normal">
            <Layers className="size-3.5" />
            {labels.admin.contentItems(items.length)}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 font-normal">
            <BookOpen className="size-3.5" />
            {materialCount}
          </Badge>
          <Badge variant="default" className="gap-1.5 font-normal">
            <HelpCircle className="size-3.5" />
            {questionCount}
          </Badge>
        </div>
        <Button asChild className="w-full gap-2 sm:w-auto">
          <Link href={newItemPath(levelId, groupId)}>
            <Plus className="size-4" />
            {labels.admin.addItem}
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={labels.admin.noItemsYet}
        >
          <Button asChild>
            <Link href={newItemPath(levelId, groupId)}>
              <Plus className="mr-2 size-4" />
              {labels.admin.addItem}
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <ContentItemCard
              key={item.id}
              item={item}
              index={index}
              pending={pending}
              editHref={editItemPath(levelId, groupId, item.id)}
              onDelete={() =>
                startTransition(() =>
                  deleteContentItem(item.id, groupId, levelId)
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContentItemCard({
  item,
  index,
  pending,
  editHref,
  onDelete,
}: {
  item: ContentItemPayload;
  index: number;
  pending: boolean;
  editHref: string;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    (item.type === "MATERIAL" &&
      (!!item.content || !!item.attachments?.length)) ||
    (item.type === "QUESTION" &&
      (!!item.subQuestions?.length || !!item.questionText));

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="surface-card overflow-hidden">
        <div className="flex items-center gap-2 p-3 sm:gap-3 sm:p-4">
          <CollapsibleTrigger asChild disabled={!hasDetails}>
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? labels.admin.hideDetails : labels.admin.showDetails}
              className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default sm:gap-3"
            >
              {hasDetails ? (
                <ChevronDown
                  className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              ) : (
                <span className="size-4 shrink-0" aria-hidden />
              )}
              <span className="text-xs font-mono text-muted-foreground">
                {index + 1}
              </span>
              <Badge variant={item.type === "MATERIAL" ? "secondary" : "default"}>
                {item.type === "MATERIAL"
                  ? labels.admin.itemMaterial
                  : labels.admin.itemQuestion}
              </Badge>
              <span className="truncate text-sm font-medium">
                {getContentItemLabel(item)}
              </span>
            </button>
          </CollapsibleTrigger>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <IconButtonTooltip label={labels.common.edit}>
              <Button
                asChild
                size="icon"
                variant="outline"
                className="size-11"
                aria-label={labels.common.edit}
              >
                <Link href={editHref}>
                  <Pencil className="size-4" />
                </Link>
              </Button>
            </IconButtonTooltip>
            <IconButtonTooltip label={labels.common.delete}>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="size-11"
                disabled={pending}
                onClick={onDelete}
                aria-label={labels.common.delete}
              >
                <Trash2 className="size-4" />
              </Button>
            </IconButtonTooltip>
          </div>
        </div>

        {hasDetails && (
          <CollapsibleContent className="border-t border-border">
            <div className="space-y-3 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {labels.admin.materialPreview}
              </p>
              <div className="rounded-lg border border-border bg-muted/30">
                {item.type === "MATERIAL" && (item.content || item.attachments?.length) && (
                  <MaterialPreview
                    title={item.title ?? undefined}
                    content={item.content ?? ""}
                    attachments={item.attachments}
                    showHeader={false}
                  />
                )}
                {item.type === "QUESTION" &&
                  (item.subQuestions?.length || item.questionText) && (
                  <QuestionPreview item={item} />
                )}
              </div>
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}
