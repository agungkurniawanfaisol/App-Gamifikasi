import { notFound } from "next/navigation";
import { SetBreadcrumbs } from "@/components/layout/set-breadcrumbs";
import { requireStudent } from "@/lib/auth-helpers";
import { getCachedLevel } from "@/lib/cached-queries";
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
  const level = await getCachedLevel(levelId);
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
