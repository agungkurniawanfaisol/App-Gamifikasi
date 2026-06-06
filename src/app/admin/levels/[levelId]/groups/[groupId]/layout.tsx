import { notFound } from "next/navigation";
import { SetBreadcrumbs } from "@/components/layout/set-breadcrumbs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { getLevelLabel } from "@/lib/labels";
import { groupEditPath } from "@/lib/content-routes";

export default async function AdminGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { levelId: string; groupId: string };
}) {
  await requireAdmin();
  const levelId = parseInt(params.levelId, 10);
  const groupId = parseInt(params.groupId, 10);

  const [level, group] = await Promise.all([
    prisma.level.findUnique({ where: { id: levelId } }),
    prisma.learningGroup.findFirst({
      where: { id: groupId, levelId },
      select: { title: true },
    }),
  ]);

  if (!level || !group) notFound();

  const levelPath = `/admin/levels/${levelId}/groups`;
  const editPath = groupEditPath(levelId, groupId);

  return (
    <>
      <SetBreadcrumbs
        overrides={{
          [levelPath]: getLevelLabel(level.name),
          [editPath]: group.title,
        }}
      />
      {children}
    </>
  );
}
