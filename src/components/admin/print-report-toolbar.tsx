"use client";

import { useEffect, useState } from "react";
import { FileDown, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  downloadBlob,
  exportPrintRootToPdfBlob,
} from "@/lib/export-print-root-pdf";
import { labels } from "@/lib/labels";

export function PrintReportToolbar({
  className,
  pdfFileName = "report.pdf",
  printRootSelector = ".admin-print-root",
}: {
  className?: string;
  pdfFileName?: string;
  printRootSelector?: string;
}) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearPreview() {
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    setPdfBlob(null);
  }

  async function handleGeneratePdf() {
    const root = document.querySelector<HTMLElement>(printRootSelector);
    if (!root) {
      toast.error(labels.admin.pdfError);
      return;
    }

    setGenerating(true);
    clearPreview();

    try {
      // Capture before opening dialog — Radix sets aria-hidden on page content.
      const blob = await exportPrintRootToPdfBlob(root);
      const url = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPreviewUrl(url);
      setOpen(true);
    } catch (error) {
      console.error("PDF generation failed:", error);
      const detail =
        error instanceof Error && error.message
          ? error.message
          : labels.admin.pdfError;
      toast.error(detail);
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, pdfFileName);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      clearPreview();
      setGenerating(false);
    }
  }

  return (
    <>
      <div
        className={
          className ??
          "flex flex-col-reverse gap-2 print:hidden sm:flex-row sm:items-center"
        }
      >
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full gap-2 sm:w-auto"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          {labels.admin.printPreview}
        </Button>
        <Button
          type="button"
          className="min-h-11 w-full gap-2 sm:w-auto"
          disabled={generating}
          onClick={() => void handleGeneratePdf()}
        >
          {generating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileDown className="size-4" />
          )}
          {generating ? labels.admin.pdfGenerating : labels.admin.generatePdf}
        </Button>
        <p className="text-xs text-muted-foreground sm:ml-2">
          {labels.admin.printHint}
        </p>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl flex-col gap-4 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{labels.admin.pdfPreviewTitle}</DialogTitle>
            <DialogDescription>
              {labels.admin.pdfPreviewDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-hidden rounded-md border bg-muted/30">
            {!previewUrl ? (
              <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-sm text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
                <p>{labels.admin.pdfGenerating}</p>
              </div>
            ) : (
              <iframe
                title={labels.admin.pdfPreviewTitle}
                src={previewUrl}
                className="h-[min(70vh,720px)] w-full bg-white"
              />
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={() => handleOpenChange(false)}
            >
              {labels.common.cancel}
            </Button>
            <Button
              type="button"
              className="min-h-11 w-full gap-2 sm:w-auto"
              disabled={!pdfBlob}
              onClick={handleDownload}
            >
              <FileDown className="size-4" />
              {labels.admin.downloadPdf}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
