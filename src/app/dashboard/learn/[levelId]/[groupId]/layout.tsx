import { notFound } from "next/navigation";
import { SetBreadcrumbs } from "@/components/layout/set-breadcrumbs";
import { SetPageLayout } from "@/components/layout/set-page-layout";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth-helpers";
import { getLevelLabel } from "@/lib/labels";

export default async function StudentGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { levelId: string; groupId: string };
}) {
  await requireStudent();
  const levelId = parseInt(params.levelId, 10);
  const groupId = parseInt(params.groupId, 10);

  const [level, group] = await Promise.all([
    prisma.level.findUnique({ where: { id: levelId } }),
    prisma.learningGroup.findFirst({
      where: { id: groupId, levelId, isPublished: true },
      select: { title: true },
    }),
  ]);

  if (!level || !group) notFound();

  const levelPath = `/dashboard/learn/${levelId}`;
  const groupPath = `/dashboard/learn/${levelId}/${groupId}`;

  return (
    <>
      <SetBreadcrumbs
        overrides={{
          [levelPath]: getLevelLabel(level.name),
          [groupPath]: group.title,
        }}
      />
      <SetPageLayout fullWidth />
      <div className="-mx-2 flex min-h-0 flex-1 flex-col overflow-hidden px-1 sm:-mx-0 sm:px-0 md:-mx-4 md:h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-4rem)]">
        {children}
      </div>
    </>
  );
}
