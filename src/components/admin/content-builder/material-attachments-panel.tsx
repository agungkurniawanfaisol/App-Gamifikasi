"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaterialAttachmentViewer } from "@/components/admin/content-builder/material-attachment-viewer";
import {
  MAX_MATERIAL_ATTACHMENTS,
  type MaterialAttachment,
} from "@/lib/material-attachments";
import { labels } from "@/lib/labels";

export function MaterialAttachmentsPanel({
  groupId,
  levelId,
  attachments,
  onChange,
}: {
  groupId: number;
  levelId: number;
  attachments: MaterialAttachment[];
  onChange: (next: MaterialAttachment[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(selected: FileList | null) {
    const files = selected ? Array.from(selected) : [];
    if (files.length === 0) return;

    if (attachments.length + files.length > MAX_MATERIAL_ATTACHMENTS) {
      setError(labels.admin.attachmentMaxCount);
      return;
    }

    setUploading(true);
    setError(null);

    const uploaded: MaterialAttachment[] = [];
    const failedNames: string[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("groupId", String(groupId));
        formData.append("levelId", String(levelId));

        const response = await fetch("/api/admin/upload/document", {
          method: "POST",
          body: formData,
        });
        const data = (await response.json()) as {
          attachment?: MaterialAttachment;
          error?: string;
        };

        if (!response.ok || !data.attachment) {
          throw new Error(data.error ?? labels.admin.attachmentUploadError);
        }

        uploaded.push(data.attachment);
      } catch {
        failedNames.push(file.name);
      }
    }

    if (uploaded.length > 0) {
      onChange([...attachments, ...uploaded]);
    }

    if (failedNames.length > 0) {
      if (uploaded.length === 0) {
        setError(labels.admin.attachmentUploadError);
      } else {
        setError(
          labels.admin.attachmentPartialFailed(
            failedNames.length,
            failedNames.join(", ")
          )
        );
      }
    }

    setUploading(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleRemove(id: string) {
    onChange(attachments.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Input
          ref={inputRef}
          type="file"
          multiple
          disabled={uploading || attachments.length >= MAX_MATERIAL_ATTACHMENTS}
          className="min-h-11"
          onChange={(event) => void handleFiles(event.target.files)}
        />
        {uploading && (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {labels.admin.attachmentUploading}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {labels.admin.materialAttachmentsHint}
      </p>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {attachments.length > 0 && (
        <div className="space-y-4">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="space-y-3">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11 gap-2 text-destructive hover:text-destructive"
                  onClick={() => handleRemove(attachment.id)}
                >
                  <Trash2 className="size-4" />
                  {labels.admin.removeAttachment}
                </Button>
              </div>
              <MaterialAttachmentViewer attachment={attachment} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
