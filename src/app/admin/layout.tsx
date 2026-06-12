import { getHeaderProfile } from "@/actions/profile";
import { requireAdmin, getUserId } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/prisma";
import { userChatTodayWhere } from "@/lib/chat-day";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const userId = getUserId(session);

  const [headerProfile, generalChatHistory] = await Promise.all([
    getHeaderProfile(),
    prisma.chatHistory.findMany({
      where: userChatTodayWhere(userId, null),
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, role: true, message: true },
    }),
  ]);

  const generalChatMessages = [...generalChatHistory].reverse().map((entry) => ({
    id: entry.id,
    role: entry.role,
    message: entry.message,
  }));

  return (
    <AppShell
      enableAiRail
      generalChatMessages={generalChatMessages}
      sidebar={<AdminSidebar />}
      headerProfile={headerProfile}
    >
      {children}
    </AppShell>
  );
}
