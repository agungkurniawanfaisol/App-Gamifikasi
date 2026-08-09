"use client";

import { labels } from "@/lib/labels";
import { parseYoutubeVideoId, toYoutubeEmbedUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";

export function QuestionMedia({
  youtubeUrl,
  audioUrl,
  className,
  compact = false,
}: {
  youtubeUrl?: string | null;
  audioUrl?: string | null;
  className?: string;
  compact?: boolean;
}) {
  const videoId = youtubeUrl ? parseYoutubeVideoId(youtubeUrl) : null;
  const embedSrc = videoId ? toYoutubeEmbedUrl(videoId) : null;

  if (!embedSrc && !audioUrl) return null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {embedSrc ? (
        <div className="flex flex-col gap-2">
          {!compact ? (
            <p className="text-sm font-medium">{labels.student.watchVideo}</p>
          ) : null}
          <div className="youtube-embed overflow-hidden rounded-md border border-border">
            <iframe
              src={embedSrc}
              title={labels.admin.youtubePreview}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 size-full border-0"
            />
          </div>
        </div>
      ) : null}
      {audioUrl ? (
        <div className="flex flex-col gap-2">
          {!compact ? (
            <p className="text-sm font-medium">{labels.student.listenAudio}</p>
          ) : null}
          <audio
            controls
            src={audioUrl}
            className={cn("w-full", compact ? "h-9" : undefined)}
          />
        </div>
      ) : null}
    </div>
  );
}
