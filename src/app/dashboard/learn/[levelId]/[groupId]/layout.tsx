import { notFound } from "next/navigation";
import { SetBreadcrumbs } from "@/components/layout/set-breadcrumbs";
import { SetPageLayout } from "@/components/layout/set-page-layout";
import { requireStudent } from "@/lib/auth-helpers";
import { getCachedLevel, getCachedPublishedGroup } from "@/lib/cached-queries";
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
    getCachedLevel(levelId),
    getCachedPublishedGroup(groupId, levelId),
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
      <div className="-mx-2 flex min-h-0 flex-col overflow-hidden px-1 sm:-mx-0 sm:px-0 md:-mx-4 md:-my-8 md:h-[calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-3.5rem)]">
        {children}
      </div>
    </>
  );
}
