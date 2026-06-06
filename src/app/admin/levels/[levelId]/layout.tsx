import { notFound } from "next/navigation";
import { SetBreadcrumbs } from "@/components/layout/set-breadcrumbs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { getLevelLabel } from "@/lib/labels";

export default async function AdminLevelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { levelId: string };
}) {
  await requireAdmin();
  const levelId = parseInt(params.levelId, 10);
  const level = await prisma.level.findUnique({ where: { id: levelId } });
  if (!level) notFound();

  const levelPath = `/admin/levels/${levelId}/groups`;

  return (
    <>
      <SetBreadcrumbs
        overrides={{ [levelPath]: getLevelLabel(level.name) }}
      />
      {children}
    </>
  );
}
