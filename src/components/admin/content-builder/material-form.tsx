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
import { MaterialAttachmentsPanel } from "@/components/admin/content-builder/material-attachments-panel";
import { EditorPreviewLayout } from "@/components/admin/content-builder/editor-preview-layout";
import { useViewMode } from "@/lib/view-mode-context";
import { MaterialPreview } from "@/components/admin/content-builder/material-preview";
import type { MaterialAttachment } from "@/lib/material-attachments";
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
  const [attachments, setAttachments] = useState<MaterialAttachment[]>(
    item?.attachments ?? []
  );
  const [pending, startTransition] = useTransition();
  const listPath = groupEditPath(levelId, groupId);

  function handleSave() {
    startTransition(async () => {
      const payload = { title, content, attachments };
      if (item) {
        await updateMaterialItem(item.id, groupId, levelId, payload);
      } else {
        await createMaterialItem(groupId, levelId, payload);
      }
    });
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="size-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold">
            {item ? labels.common.edit : labels.admin.addMaterial}
          </h3>
          <p className="text-xs text-muted-foreground">
            {item ? `ID: ${item.id} · Order: ${item.order}` : labels.admin.typeMaterialDesc}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-4 sm:p-5">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {labels.common.title}
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={labels.admin.groupTitlePlaceholder}
            className="min-h-11 text-base"
          />
        </div>

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
              <MaterialPreview
                title={title}
                content={content}
                attachments={attachments}
                showHeader={false}
              />
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {labels.admin.materialAttachments}
          </Label>
          <MaterialAttachmentsPanel
            groupId={groupId}
            levelId={levelId}
            attachments={attachments}
            onChange={setAttachments}
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
        <Button
          type="button"
          disabled={pending || !title.trim()}
          onClick={handleSave}
          className="min-h-11 w-full gap-2 sm:w-auto"
        >
          <Save className="size-4" />
          {labels.common.save}
        </Button>
        <Button
          type="button"
          variant="outline"
          asChild
          className="min-h-11 w-full gap-2 sm:w-auto"
        >
          <Link href={listPath}>
            <X className="size-4" />
            {labels.common.cancel}
          </Link>
        </Button>
      </div>
    </div>
  );
}
