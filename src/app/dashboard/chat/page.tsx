import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ChatInterface } from "@/components/student/chat-interface";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";
import { userChatTodayWhere } from "@/lib/chat-day";
import { mapChatHistoryRows } from "@/lib/chat-message-meta";

export default async function ChatPage() {
  const session = await requireStudent();
  const userId = getUserId(session);

  const history = await prisma.chatHistory.findMany({
    where: userChatTodayWhere(userId, null),
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const messages = mapChatHistoryRows([...history].reverse());

  return (
    <div className="flex min-h-[min(480px,70dvh)] flex-col">
      <PageHeader
        title={labels.student.chatTitle}
        description={labels.student.chatSubtitle}
      />
      <div className="min-h-0 flex-1">
        <ChatInterface initialMessages={messages} className="h-full min-h-[min(420px,55dvh)] max-h-none sm:max-h-[calc(100dvh-12rem)]" />
      </div>
    </div>
  );
}
