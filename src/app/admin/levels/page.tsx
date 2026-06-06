import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getLevelLabel, labels } from "@/lib/labels";
import { Layers } from "lucide-react";

export default async function AdminLevelsPage() {
  const levels = await prisma.level.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { groups: true } },
      groups: { where: { isPublished: true }, select: { id: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader title={labels.admin.learningLevels} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {levels.map((level) => (
          <div
            key={level.id}
            className="surface-card-interactive p-6"
          >
            <div className="mb-4 flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Layers className="size-4" />
            </div>
            <h3 className="font-semibold">{getLevelLabel(level.name)}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {labels.admin.groupsPublished(
                level._count.groups,
                level.groups.length
              )}
            </p>
            <Button asChild className="mt-5 w-full" size="sm">
              <Link href={`/admin/levels/${level.id}/groups`}>
                {labels.admin.manageContent}
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
