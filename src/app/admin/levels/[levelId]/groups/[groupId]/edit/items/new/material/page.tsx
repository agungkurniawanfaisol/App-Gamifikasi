import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MaterialForm } from "@/components/admin/content-builder/material-form";

export default async function NewMaterialPage({
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

  return <MaterialForm levelId={levelId} groupId={groupId} />;
}
