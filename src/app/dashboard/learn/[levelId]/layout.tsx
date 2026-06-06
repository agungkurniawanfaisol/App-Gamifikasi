import { notFound } from "next/navigation";
import { SetBreadcrumbs } from "@/components/layout/set-breadcrumbs";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth-helpers";
import { getLevelLabel } from "@/lib/labels";

export default async function StudentLevelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { levelId: string };
}) {
  await requireStudent();
  const levelId = parseInt(params.levelId, 10);
  const level = await prisma.level.findUnique({ where: { id: levelId } });
  if (!level) notFound();

  const levelPath = `/dashboard/learn/${levelId}`;

  return (
    <div className="m-1">
      <SetBreadcrumbs
        overrides={{ [levelPath]: getLevelLabel(level.name) }}
      />
      {children}
    </div>
  );
}
