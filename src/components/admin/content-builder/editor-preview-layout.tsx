"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, GripVertical, Maximize2, Minimize2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

const MIN_PREVIEW_WIDTH = 280;
const MAX_PREVIEW_WIDTH = 800;
const DEFAULT_PREVIEW_WIDTH = 380;

export type ViewMode = "split" | "editor" | "preview";

function PreviewHeader({
  onFullscreen,
  isFullscreen = false,
}: {
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <Eye className="size-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {labels.admin.materialPreview}
        </p>
      </div>
      {onFullscreen ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          onClick={onFullscreen}
          aria-label={
            isFullscreen
              ? labels.admin.previewExitFullscreen
              : labels.admin.previewFullscreen
          }
          title={
            isFullscreen
              ? labels.admin.previewExitFullscreen
              : labels.admin.previewFullscreen
          }
        >
          {isFullscreen ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </Button>
      ) : null}
    </div>
  );
}

export function EditorPreviewLayout({
  editor,
  preview,
  mode,
  onModeChange,
}: {
  editor: React.ReactNode;
  preview: React.ReactNode;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(DEFAULT_PREVIEW_WIDTH);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const isSplit = mode === "split";
  const showPreview = mode === "split" || mode === "preview";
  const showEditor = mode === "split" || mode === "editor";

  const openFullscreen = useCallback(() => {
    setFullscreen(true);
    onModeChange("preview");
  }, [onModeChange]);

  const closeFullscreen = useCallback(() => {
    setFullscreen(false);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setFullscreen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setIsDraggingState(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawWidth = rect.right - e.clientX - 48; // 48 = toggle column
      const clamped = Math.min(MAX_PREVIEW_WIDTH, Math.max(MIN_PREVIEW_WIDTH, rawWidth));
      setPreviewWidth(clamped);
    }

    function handleMouseUp() {
      if (isDragging.current) {
        isDragging.current = false;
        setIsDraggingState(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  // ─── Mobile ────────────────────────────────────────
  const mobileContent = (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex min-w-0 flex-col gap-2">{editor}</div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className="min-h-11 w-full gap-2 sm:flex-1">
              <Eye className="size-4" />
              {labels.admin.materialPreview}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[min(80dvh,40rem)] p-0">
            <SheetTitle className="sr-only">{labels.admin.materialPreview}</SheetTitle>
            <div className="flex h-full flex-col overflow-hidden rounded-t-lg border-t border-border bg-background">
              <PreviewHeader onFullscreen={openFullscreen} />
              <div className="min-h-0 flex-1 overflow-y-auto">{preview}</div>
            </div>
          </SheetContent>
        </Sheet>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full gap-2 sm:flex-1"
          onClick={openFullscreen}
        >
          <Maximize2 className="size-4" />
          {labels.admin.previewFullscreen}
        </Button>
      </div>
    </div>
  );

  // ─── Desktop ────────────────────────────────────────
  const desktopContent = (
    <div ref={containerRef} className="hidden min-h-[360px] md:flex">
      {/* Editor panel */}
      <div
        className={cn(
          "flex flex-col gap-2 overflow-hidden",
          showEditor ? "min-w-0 flex-1 px-1" : "w-0"
        )}
      >
        {showEditor && (
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <PenLine className="size-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {labels.admin.viewModeEditor}
            </p>
          </div>
        )}
        <div className={cn("min-w-0", showEditor ? "flex-1" : "hidden")}>
          {editor}
        </div>
      </div>

      {/* Toggle column (drag handle only) */}
      <div className="relative flex w-12 shrink-0 flex-col items-center">
        {/* Drag handle — only in split mode */}
        {isSplit && (
          <div
            onMouseDown={handleMouseDown}
            className="absolute inset-y-0 left-0 z-10 w-1 cursor-col-resize rounded-full transition-colors hover:bg-primary/40 active:bg-primary/60"
            title={labels.admin.dragToResize}
          />
        )}

        {/* Grip indicator — only in split mode */}
        {isSplit && (
          <div className="mt-16 flex flex-col items-center gap-0.5 opacity-15">
            <GripVertical className="size-3" />
            <GripVertical className="size-3 -mt-2" />
          </div>
        )}
      </div>

      {/* Preview panel */}
      <div
        className={cn(
          "flex flex-col overflow-hidden",
          showPreview ? "" : "w-0",
          isSplit && (isDraggingState ? "" : "transition-[width] duration-200 ease-in-out")
        )}
        style={
          isSplit && showPreview
            ? { width: previewWidth, minWidth: MIN_PREVIEW_WIDTH, maxWidth: MAX_PREVIEW_WIDTH }
            : mode === "preview"
              ? { flex: 1, minWidth: 0 }
              : undefined
        }
      >
        <div
          className={cn(
            "flex h-full flex-col overflow-hidden rounded-lg border border-border bg-muted/30",
            showPreview ? "mx-2" : "mx-0"
          )}
        >
          <PreviewHeader onFullscreen={openFullscreen} />
          <div className="min-h-0 flex-1 overflow-y-auto">{preview}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[360px]">
      {mobileContent}
      {desktopContent}

      {fullscreen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background"
          role="dialog"
          aria-modal="true"
          aria-label={labels.admin.previewFullscreen}
        >
          <PreviewHeader isFullscreen onFullscreen={closeFullscreen} />
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="mx-auto w-full max-w-5xl">{preview}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
