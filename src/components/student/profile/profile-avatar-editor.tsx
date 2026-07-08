"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { UserAvatar } from "@/components/layout/user-avatar";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";

type ProfileAvatarEditorProps = {
  name: string;
  imageUrl: string | null;
  onImageUrlChange: (url: string) => void;
};

export function ProfileAvatarEditor({
  name,
  imageUrl,
  onImageUrlChange,
}: ProfileAvatarEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? labels.profile.uploadFailed);
      }

      onImageUrlChange(data.url);
      setFeedback({ type: "success", message: labels.profile.photoUploadSuccess });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : labels.profile.uploadFailed,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <UserAvatar name={name} imageUrl={imageUrl} size="xl" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handlePhotoChange}
        aria-label={labels.profile.changePhoto}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 gap-2"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <Camera className="size-4" />
        {uploading ? labels.profile.uploading : labels.profile.changePhoto}
      </Button>
      {feedback ? (
        <p
          className={
            feedback.type === "success"
              ? "text-center text-xs text-emerald-700 dark:text-emerald-300"
              : "text-center text-xs text-destructive"
          }
          role={feedback.type === "success" ? "status" : "alert"}
          aria-live="polite"
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
