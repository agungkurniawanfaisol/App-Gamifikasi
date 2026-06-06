import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TypePicker } from "@/components/admin/content-builder/item-wizards";

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

  return <TypePicker levelId={levelId} groupId={groupId} />;
}
