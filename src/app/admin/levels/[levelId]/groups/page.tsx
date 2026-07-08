import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLevelGroupsStats } from "@/actions/admin/stats";
import { GroupList } from "@/components/admin/group-list";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getLevelLabel, labels } from "@/lib/labels";
import { ArrowLeft, Plus } from "lucide-react";

export default async function GroupsListPage({
  params,
}: {
  params: { levelId: string };
}) {
  const levelId = parseInt(params.levelId, 10);
  const level = await prisma.level.findUnique({ where: { id: levelId } });
  if (!level) notFound();

  const groups = await getLevelGroupsStats(levelId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={labels.admin.levelPrefix(getLevelLabel(level.name))}
        description={labels.admin.manageContent}
      >
        <>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="min-h-11 w-full gap-2 sm:w-auto"
          >
            <Link href="/admin/levels">
              <ArrowLeft className="size-4" />
              {labels.admin.backToLevels}
            </Link>
          </Button>

          <Button asChild className="min-h-11 gap-2 w-full sm:w-auto">
            <Link href={`/admin/levels/${levelId}/groups/create`}>
              <Plus className="size-4" />
              {labels.admin.addNewGroup}
            </Link>
          </Button>
        </>
      </PageHeader>

      <GroupList levelId={levelId} groups={groups} />
    </div>
  );
}
