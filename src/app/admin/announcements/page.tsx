import { listAnnouncements } from "@/actions/admin/announcements";
import { AnnouncementPanel } from "@/components/admin/announcement-panel";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function AdminAnnouncementsPage() {
  const announcements = await listAnnouncements();

  return (
    <div className="space-y-6">
      <PageHeader
        title={labels.admin.announcementsTitle}
        description={labels.admin.announcementsDescription}
      />
      <AnnouncementPanel announcements={announcements} />
    </div>
  );
}
