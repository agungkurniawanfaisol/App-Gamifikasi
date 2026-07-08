import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { ActiveAnnouncement } from "@/lib/announcement-queries";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AnnouncementCard({
  announcement,
}: {
  announcement: ActiveAnnouncement;
}) {
  return (
    <article className="surface-card overflow-hidden p-4 sm:p-6">
      <div className="min-w-0 space-y-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold leading-snug sm:text-lg">
            {announcement.title}
          </h2>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{labels.announcements.postedOn(formatDate(announcement.startsAt))}</span>
            {announcement.endsAt && (
              <span>{labels.announcements.expiresOn(formatDate(announcement.endsAt))}</span>
            )}
          </p>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {announcement.message}
        </p>
        {announcement.linkUrl && (
          <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
            <Link
              href={announcement.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              {announcement.linkLabel ?? labels.announcements.readMore}
              <ExternalLink className="size-4 shrink-0" />
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
