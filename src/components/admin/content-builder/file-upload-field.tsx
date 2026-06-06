"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { labels } from "@/lib/labels";
import { Upload } from "lucide-react";

export function FileUploadField({
  groupId,
  accept,
  label,
  onUploaded,
  currentUrl,
}: {
  groupId: number;
  accept: string;
  label: string;
  onUploaded: (url: string) => void;
  currentUrl?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("groupId", String(groupId));
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed");
      }
      onUploaded(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <Input type="file" accept={accept} onChange={handleChange} disabled={uploading} />
        <Button type="button" variant="outline" size="sm" disabled className="gap-2 shrink-0">
          <Upload className="size-4" />
          {uploading ? "..." : labels.common.save}
        </Button>
      </div>
      {currentUrl && (
        <p className="text-xs text-muted-foreground truncate">Uploaded: {currentUrl}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
