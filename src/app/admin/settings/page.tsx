import { getSettingsOverview } from "@/actions/admin/settings";
import { SettingsPanel } from "@/components/admin/settings-panel";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function AdminSettingsPage() {
  const data = await getSettingsOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title={labels.admin.settingsTitle}
        description={labels.admin.settingsDescription}
      />
      <SettingsPanel data={data} />
    </div>
  );
}
