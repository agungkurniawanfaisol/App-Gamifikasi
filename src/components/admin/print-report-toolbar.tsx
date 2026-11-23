"use client";

import { FileDown, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";

export function PrintReportToolbar({
  className,
}: {
  className?: string;
}) {
  return (
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
        onClick={() => window.print()}
      >
        <FileDown className="size-4" />
        {labels.admin.generatePdf}
      </Button>
      <p className="text-xs text-muted-foreground sm:ml-2">
        {labels.admin.printHint}
      </p>
    </div>
  );
}
