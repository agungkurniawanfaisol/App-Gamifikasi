import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { GroupEditHeader } from "@/components/admin/group-edit-header";
import { ViewModeProvider } from "@/lib/view-mode-context";

export default async function GroupEditLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { levelId: string; groupId: string };
}) {
  await requireAdmin();
  const levelId = parseInt(params.levelId, 10);
  const groupId = parseInt(params.groupId, 10);

  const group = await prisma.learningGroup.findFirst({
    where: { id: groupId, levelId },
    select: { title: true, dueAt: true, isPremium: true },
  });
  if (!group) notFound();

  const dueAtValue = group.dueAt
    ? new Date(group.dueAt.getTime() - group.dueAt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : null;

  return (
    <ViewModeProvider>
      <div className="flex flex-col gap-6">
        <GroupEditHeader
          levelId={levelId}
          groupId={groupId}
          title={group.title}
          dueAt={dueAtValue}
          isPremium={group.isPremium}
        />
        {children}
      </div>
    </ViewModeProvider>
  );
}
