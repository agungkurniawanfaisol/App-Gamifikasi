import {
  getChatMonitorEntries,
  getChatMonitorStudents,
} from "@/actions/admin/chat-monitor";
import { ChatMonitorPanel } from "@/components/admin/chat-monitor-panel";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function AdminChatMonitorPage() {
  const [{ entries }, students] = await Promise.all([
    getChatMonitorEntries({ take: 100 }),
    getChatMonitorStudents(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={labels.admin.chatMonitorTitle}
        description={labels.admin.chatMonitorDescription}
      />
      <ChatMonitorPanel entries={entries} students={students} />
    </div>
  );
}
