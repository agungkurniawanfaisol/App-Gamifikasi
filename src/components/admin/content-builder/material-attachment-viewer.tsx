"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MaterialAttachment } from "@/lib/material-attachments";
import { getAttachmentPreviewKind } from "@/lib/material-attachment-preview";
import { labels } from "@/lib/labels";

export function MaterialAttachmentViewer({
  attachment,
}: {
  attachment: MaterialAttachment;
}) {
  const kind = getAttachmentPreviewKind(attachment.mimeType);

  return (
    <div className="min-w-0 space-y-3 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-4 shrink-0 text-primary" />
          <p className="truncate text-sm font-medium">{attachment.fileName}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 shrink-0 gap-2"
          asChild
        >
          <a href={attachment.url} download={attachment.fileName}>
            <Download className="size-4" />
            <span className="hidden sm:inline">{labels.admin.attachmentDownload}</span>
          </a>
        </Button>
      </div>

      {kind === "pdf" && (
        <iframe
          src={attachment.url}
          title={labels.admin.attachmentPreviewPdf}
          className="h-[min(70vh,560px)] w-full rounded-md border border-border bg-background"
        />
      )}

      {kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className="max-h-[min(70vh,560px)] w-full rounded-md border border-border bg-background object-contain"
        />
      )}

      {kind === "pptx" && <PptxAttachmentPreview attachment={attachment} />}

      {kind === "download" && (
        <p className="text-sm text-muted-foreground">
          {labels.admin.attachmentUnsupported}
        </p>
      )}
    </div>
  );
}

function PptxAttachmentPreview({
  attachment,
}: {
  attachment: MaterialAttachment;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previewerRef = useRef<{
    preview: (file: ArrayBuffer) => Promise<unknown>;
    renderNextSlide: () => void;
    renderPreSlide: () => void;
    slideCount: number;
    destroy: () => void;
  } | null>(null);
  const [slideIndex, setSlideIndex] = useState(1);
  const [slideTotal, setSlideTotal] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      if (!containerRef.current) return;
      setLoading(true);
      setLoadError(null);

      try {
        const { init } = await import("pptx-preview");
        const response = await fetch(attachment.url);
        if (!response.ok) throw new Error("fetch failed");
        const buffer = await response.arrayBuffer();

        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = "";
        const previewer = init(containerRef.current, {
          mode: "slide",
          width: containerRef.current.clientWidth || 640,
          height: 360,
        });

        await previewer.preview(buffer);
        if (cancelled) {
          previewer.destroy();
          return;
        }

        previewerRef.current = previewer;
        setSlideTotal(previewer.slideCount);
        setSlideIndex(previewer.slideCount > 0 ? 1 : 0);
      } catch {
        if (!cancelled) {
          setLoadError(labels.admin.attachmentPptxLoadError);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
      previewerRef.current?.destroy();
      previewerRef.current = null;
    };
  }, [attachment.url]);

  function handlePrevious() {
    previewerRef.current?.renderPreSlide();
    setSlideIndex((current) => Math.max(1, current - 1));
  }

  function handleNext() {
    previewerRef.current?.renderNextSlide();
    setSlideIndex((current) =>
      slideTotal > 0 ? Math.min(slideTotal, current + 1) : current + 1
    );
  }

  if (loadError) {
    return <p className="text-sm text-destructive">{loadError}</p>;
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="min-h-[240px] w-full overflow-hidden rounded-md border border-border bg-background"
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{labels.admin.attachmentUploading}</p>
      ) : slideTotal > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {labels.admin.attachmentPptxSlide(slideIndex, slideTotal)}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full gap-2 sm:w-auto"
              onClick={handlePrevious}
              disabled={slideIndex <= 1}
            >
              <ChevronLeft className="size-4" />
              {labels.admin.attachmentPptxPrev}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full gap-2 sm:w-auto"
              onClick={handleNext}
              disabled={slideIndex >= slideTotal}
            >
              {labels.admin.attachmentPptxNext}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
