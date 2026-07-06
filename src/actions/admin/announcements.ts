"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export type AnnouncementListItem = {
  id: number;
  title: string;
  message: string;
  linkUrl: string | null;
  linkLabel: string | null;
  startsAt: Date;
  endsAt: Date | null;
  isActive: boolean;
  targetRole: Role | null;
  updatedAt: Date;
};

const announcementSchema = z.object({
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  linkUrl: z.preprocess(
    (v) => {
      const s = String(v ?? "").trim();
      return s.length ? s : null;
    },
    z.union([z.string().url(), z.null()])
  ),
  linkLabel: z.preprocess(
    (v) => {
      const s = String(v ?? "").trim();
      return s.length ? s : null;
    },
    z.union([z.string().max(100), z.null()])
  ),
  startsAt: z.coerce.date(),
  endsAt: z.preprocess(
    (v) => {
      const s = String(v ?? "").trim();
      return s.length ? new Date(s) : null;
    },
    z.union([z.date(), z.null()])
  ),
  targetRole: z
    .enum(["", "STUDENT", "ADMIN"])
    .transform((v) => (v === "" ? null : (v as Role))),
  isActive: z.coerce.boolean(),
});

function parseAnnouncementForm(formData: FormData) {
  return announcementSchema.parse({
    title: formData.get("title"),
    message: formData.get("message"),
    linkUrl: formData.get("linkUrl")?.toString() ?? "",
    linkLabel: formData.get("linkLabel")?.toString() ?? "",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt")?.toString() ?? "",
    targetRole: formData.get("targetRole")?.toString() ?? "",
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });
}

function revalidateAnnouncements() {
  revalidatePath("/admin/announcements");
}

export async function listAnnouncements(): Promise<AnnouncementListItem[]> {
  await requireAdmin();
  return prisma.announcement.findMany({
    orderBy: [{ isActive: "desc" }, { startsAt: "desc" }],
    select: {
      id: true,
      title: true,
      message: true,
      linkUrl: true,
      linkLabel: true,
      startsAt: true,
      endsAt: true,
      isActive: true,
      targetRole: true,
      updatedAt: true,
    },
  });
}

export async function createAnnouncement(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const data = parseAnnouncementForm(formData);
    await prisma.announcement.create({ data });
    revalidateAnnouncements();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not save announcement.",
    };
  }
}

export async function updateAnnouncement(
  id: number,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    const data = parseAnnouncementForm(formData);
    await prisma.announcement.update({ where: { id }, data });
    revalidateAnnouncements();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not save announcement.",
    };
  }
}

export async function deleteAnnouncement(
  id: number
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await prisma.announcement.delete({ where: { id } });
  revalidateAnnouncements();
  return { ok: true };
}

export async function toggleAnnouncementActive(
  id: number,
  isActive: boolean
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await prisma.announcement.update({ where: { id }, data: { isActive } });
  revalidateAnnouncements();
  return { ok: true };
}
