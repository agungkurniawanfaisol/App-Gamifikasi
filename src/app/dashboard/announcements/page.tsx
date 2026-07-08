import { Role } from "@prisma/client";
import { Megaphone } from "lucide-react";
import { requireStudent } from "@/lib/auth-helpers";
import { getActiveAnnouncementsForRole } from "@/lib/announcement-queries";
import { AnnouncementCard } from "@/components/student/announcements/announcement-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function StudentAnnouncementsPage() {
  await requireStudent();
  const announcements = await getActiveAnnouncementsForRole(Role.STUDENT);

  return (
    <div className="animate-slide-up space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2.5 sm:gap-3">
            <Megaphone className="size-6 shrink-0 text-primary sm:size-7" />
            <span className="truncate">{labels.announcements.title}</span>
          </span>
        }
        description={labels.announcements.subtitle}
      />

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={labels.announcements.empty}
          description={labels.announcements.emptyHint}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}
    </div>
  );
}
