"use client";

import Link from "next/link";
import { useRef, useTransition } from "react";
import { Copy, Download, Eye, Upload } from "lucide-react";
import {
  cloneGroup,
  exportGroupJson,
  importGroupJson,
} from "@/actions/admin/content-tools";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";

export function ContentToolsBar({
  levelId,
  groupId,
}: {
  levelId: number;
  groupId: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const data = await exportGroupJson(groupId);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `group-${groupId}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  function handleImport(file: File) {
    startTransition(async () => {
      const text = await file.text();
      const payload = JSON.parse(text) as Parameters<typeof importGroupJson>[1];
      await importGroupJson(levelId, payload);
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full sm:w-auto"
        disabled={pending}
        onClick={() => startTransition(() => cloneGroup(groupId, levelId))}
      >
        <Copy className="size-4" />
        {labels.admin.cloneGroup}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full sm:w-auto"
        disabled={pending}
        onClick={handleExport}
      >
        <Download className="size-4" />
        {labels.admin.exportGroup}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full sm:w-auto"
        disabled={pending}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="size-4" />
        {labels.admin.importGroup}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImport(file);
          e.target.value = "";
        }}
      />

      <Button asChild variant="secondary" className="min-h-11 w-full sm:w-auto">
        <Link href={`/admin/preview/${levelId}/${groupId}`}>
          <Eye className="size-4" />
          {labels.admin.previewAsStudent}
        </Link>
      </Button>
    </div>
  );
}
