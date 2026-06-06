"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

function parseDueAt(value: FormDataEntryValue | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid due date.");
  }
  return date;
}

export async function createGroup(levelId: number, formData: FormData) {
  await requireAdmin();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return;

  const maxOrder = await prisma.learningGroup.aggregate({
    where: { levelId },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? 0) + 1;

  const group = await prisma.learningGroup.create({
    data: {
      levelId,
      title,
      order,
      dueAt: parseDueAt(formData.get("dueAt")),
    },
  });

  revalidatePath(`/admin/levels/${levelId}/groups`);
  redirect(`/admin/levels/${levelId}/groups/${group.id}/edit`);
}

export async function updateGroup(
  groupId: number,
  levelId: number,
  formData: FormData
) {
  await requireAdmin();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return;

  await prisma.learningGroup.update({
    where: { id: groupId },
    data: {
      title,
      dueAt: parseDueAt(formData.get("dueAt")),
      isPremium: formData.get("isPremium") === "on",
    },
  });
  revalidatePath(`/admin/levels/${levelId}/groups/${groupId}/edit`);
}

export async function deleteGroup(groupId: number, levelId: number) {
  await requireAdmin();
  await prisma.learningGroup.delete({ where: { id: groupId } });
  revalidatePath(`/admin/levels/${levelId}/groups`);
  redirect(`/admin/levels/${levelId}/groups`);
}

export async function togglePublishGroup(groupId: number, levelId: number) {
  await requireAdmin();
  const group = await prisma.learningGroup.findUnique({
    where: { id: groupId },
  });
  if (!group) return;

  await prisma.learningGroup.update({
    where: { id: groupId },
    data: { isPublished: !group.isPublished },
  });
  revalidatePath(`/admin/levels/${levelId}/groups`);
}
