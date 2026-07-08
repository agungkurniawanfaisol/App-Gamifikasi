"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { BookOpen, Loader2, Save, X } from "lucide-react";
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
import { toast } from "sonner";

export function MaterialForm({
  levelId,
  groupId,
  item,
  initialValues,
}: {
  levelId: number;
  groupId: number;
  item?: ContentItemPayload;
  initialValues?: { title?: string; content?: string; attachments?: MaterialAttachment[] };
}) {
  const { viewMode, setViewMode } = useViewMode();
  const [title, setTitle] = useState(item?.title ?? initialValues?.title ?? "");
  const [content, setContent] = useState(item?.content ?? initialValues?.content ?? "");
  const [attachments, setAttachments] = useState<MaterialAttachment[]>(
    item?.attachments ?? initialValues?.attachments ?? []
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const listPath = groupEditPath(levelId, groupId);

  function handleSave() {
    setSaveError(null);
    startTransition(async () => {
      try {
        const payload = { title, content, attachments };
        if (item) {
          await updateMaterialItem(item.id, groupId, levelId, payload);
        } else {
          await createMaterialItem(groupId, levelId, payload);
        }
        toast.success(labels.admin.saveSuccess);
      } catch {
        setSaveError(labels.admin.saveFailed);
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
            {item
              ? labels.admin.contentItemMeta(item.id, item.order)
              : labels.admin.typeMaterialDesc}
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
        {saveError && (
          <p className="w-full text-sm text-destructive sm:mr-auto" role="alert">
            {saveError}
          </p>
        )}
        <Button
          type="button"
          disabled={pending || !title.trim()}
          onClick={handleSave}
          className="min-h-11 w-full gap-2 sm:w-auto"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {pending ? labels.admin.saving : labels.common.save}
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
