import { Megaphone } from "lucide-react";
import type { ActiveAnnouncement } from "@/lib/announcement-queries";
import { AnnouncementCard } from "@/components/student/announcements/announcement-card";
import { labels } from "@/lib/labels";

export function AnnouncementBannerStack({
  announcements,
}: {
  announcements: ActiveAnnouncement[];
}) {
  if (announcements.length === 0) return null;

  return (
    <section className="space-y-3" aria-label={labels.announcements.title}>
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Megaphone className="size-4" />
        </div>
        <h2 className="text-sm font-semibold">{labels.announcements.title}</h2>
      </div>
      <div className="flex flex-col gap-3">
        {announcements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </div>
    </section>
  );
}
