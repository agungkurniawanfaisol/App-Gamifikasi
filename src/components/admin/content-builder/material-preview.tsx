"use client";

import { BookOpen, FileText } from "lucide-react";
import { tiptapJsonToHtml } from "@/lib/content-item";
import { labels } from "@/lib/labels";

export function MaterialPreview({
  title,
  content,
  showHeader = true,
}: {
  title?: string;
  content: string;
  showHeader?: boolean;
}) {
  const html = tiptapJsonToHtml(content);
  const isEmpty = !html.trim();

  return (
    <div className="flex flex-col">
      {showHeader && (
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <BookOpen className="size-3.5 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {labels.admin.materialPreview}
          </p>
        </div>
      )}
      <div className="p-4">
        {title && (
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FileText className="size-4 text-primary" />
            {title}
          </h3>
        )}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <BookOpen className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {labels.admin.materialPreviewEmpty}
            </p>
          </div>
        ) : (
          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
}
