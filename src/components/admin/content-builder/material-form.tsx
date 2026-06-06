"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { BookOpen, Save, X } from "lucide-react";
import {
  createMaterialItem,
  updateMaterialItem,
} from "@/actions/admin/content-items";
import type { ContentItemPayload } from "@/lib/content-item";
import { groupEditPath } from "@/lib/content-routes";
import { MaterialEditor } from "@/components/admin/content-builder/material-editor";
import { EditorPreviewLayout } from "@/components/admin/content-builder/editor-preview-layout";
import { useViewMode } from "@/lib/view-mode-context";
import { MaterialPreview } from "@/components/admin/content-builder/material-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { labels } from "@/lib/labels";

export function MaterialForm({
  levelId,
  groupId,
  item,
}: {
  levelId: number;
  groupId: number;
  item?: ContentItemPayload;
}) {
  const { viewMode, setViewMode } = useViewMode();
  const [title, setTitle] = useState(item?.title ?? "");
  const [content, setContent] = useState(item?.content ?? "");
  const [pending, startTransition] = useTransition();
  const listPath = groupEditPath(levelId, groupId);

  function handleSave() {
    startTransition(async () => {
      if (item) {
        await updateMaterialItem(item.id, groupId, levelId, { title, content });
      } else {
        await createMaterialItem(groupId, levelId, { title, content });
      }
    });
  }

  return (
    <div className="surface-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="size-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold">{item ? labels.common.edit : labels.admin.addMaterial}</h3>
          <p className="text-xs text-muted-foreground">
            {item ? `ID: ${item.id} · Order: ${item.order}` : labels.admin.typeMaterialDesc}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-5 p-5">
        {/* Title Section */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {labels.common.title}
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={labels.admin.groupTitlePlaceholder}
            className="text-base"
          />
        </div>

        {/* Editor + Preview */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {labels.admin.editorLabel}
          </Label>
          <EditorPreviewLayout
            mode={viewMode}
            onModeChange={setViewMode}
            editor={
              <MaterialEditor
                groupId={groupId}
                initialContent={item?.content ?? undefined}
                onChange={setContent}
              />
            }
            preview={
              <MaterialPreview title={title} content={content} showHeader={false} />
            }
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          disabled={pending || !title.trim()}
          onClick={handleSave}
          className="w-full gap-2 sm:w-auto"
        >
          <Save className="size-4" />
          {labels.common.save}
        </Button>
        <Button type="button" variant="outline" asChild className="w-full gap-2 sm:w-auto">
          <Link href={listPath}>
            <X className="size-4" />
            {labels.common.cancel}
          </Link>
        </Button>
      </div>
    </div>
  );
}
