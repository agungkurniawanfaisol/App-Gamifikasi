import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TypePicker } from "@/components/admin/content-builder/item-wizards";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";

export default async function NewContentItemPage({
  params,
}: {
  params: { levelId: string; groupId: string };
}) {
  const levelId = parseInt(params.levelId, 10);
  const groupId = parseInt(params.groupId, 10);

  const group = await prisma.learningGroup.findFirst({
    where: { id: groupId, levelId },
    select: { id: true },
  });
  if (!group) notFound();

  return (
    <div className="space-y-4">
      <Button asChild variant="outline" size="sm" className="min-h-11 w-full sm:w-auto">
        <Link href={`/admin/levels/${levelId}/groups/${groupId}/edit`}>
          {labels.admin.backToGroupEdit}
        </Link>
      </Button>
      <TypePicker levelId={levelId} groupId={groupId} />
    </div>
  );
}
