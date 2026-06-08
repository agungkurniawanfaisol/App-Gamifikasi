import { getGamificationOverview } from "@/actions/admin/gamification";
import { GamificationPanel } from "@/components/admin/gamification-panel";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function AdminGamificationPage() {
  const data = await getGamificationOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title={labels.admin.gamificationTitle}
        description={labels.admin.gamificationDescription}
      />
      <GamificationPanel data={data} />
    </div>
  );
}
