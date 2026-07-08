import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ActiveAnnouncement = {
  id: number;
  title: string;
  message: string;
  linkUrl: string | null;
  linkLabel: string | null;
  startsAt: Date;
  endsAt: Date | null;
};

const announcementSelect = {
  id: true,
  title: true,
  message: true,
  linkUrl: true,
  linkLabel: true,
  startsAt: true,
  endsAt: true,
} as const;

function activeAnnouncementWhere(role: Role, now: Date) {
  return {
    isActive: true,
    startsAt: { lte: now },
    AND: [
      {
        OR: [{ endsAt: null }, { endsAt: { gte: now } }],
      },
      {
        OR: [{ targetRole: null }, { targetRole: role }],
      },
    ],
  };
}

export async function getActiveAnnouncementsForRole(
  role: Role,
  limit?: number
): Promise<ActiveAnnouncement[]> {
  const now = new Date();

  return prisma.announcement.findMany({
    where: activeAnnouncementWhere(role, now),
    orderBy: [{ startsAt: "desc" }],
    select: announcementSelect,
    ...(limit != null ? { take: limit } : {}),
  });
}

export async function getActiveAnnouncementCountForRole(
  role: Role
): Promise<number> {
  const now = new Date();

  return prisma.announcement.count({
    where: activeAnnouncementWhere(role, now),
  });
}
