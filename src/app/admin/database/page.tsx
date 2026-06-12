import { DatabaseBackupPanel } from "@/components/admin/database-backup-panel";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default function AdminDatabasePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title={labels.admin.databaseTitle}
        description={labels.admin.databaseDescription}
      />
      <DatabaseBackupPanel />
    </div>
  );
}
