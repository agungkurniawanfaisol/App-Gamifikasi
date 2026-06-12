"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { chatMonitorDateRange, type ChatMonitorDatePreset } from "@/lib/chat-day";
import { prisma } from "@/lib/prisma";
import type { ChatRole } from "@prisma/client";

export type ChatMonitorEntry = {
  id: number;
  userId: number;
  userName: string;
  groupId: number | null;
  groupTitle: string | null;
  role: ChatRole;
  message: string;
  createdAt: Date;
};

type GetChatMonitorEntriesInput = {
  take?: number;
  studentId?: number;
  datePreset?: ChatMonitorDatePreset;
};

export async function getChatMonitorEntries(
  input: GetChatMonitorEntriesInput = {}
): Promise<{ entries: ChatMonitorEntry[] }> {
  await requireAdmin();

  const take = input.take ?? 200;
  const { from, to } = chatMonitorDateRange(input.datePreset ?? "all");

  const rows = await prisma.chatHistory.findMany({
    where: {
      user: { role: "STUDENT" },
      ...(input.studentId != null ? { userId: input.studentId } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      userId: true,
      groupId: true,
      role: true,
      message: true,
      createdAt: true,
      user: { select: { name: true } },
      group: { select: { title: true } },
    },
  });

  return {
    entries: rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      userName: row.user.name,
      groupId: row.groupId,
      groupTitle: row.group?.title ?? null,
      role: row.role,
      message: row.message,
      createdAt: row.createdAt,
    })),
  };
}

export async function getChatMonitorStudents(): Promise<
  { id: number; name: string }[]
> {
  await requireAdmin();

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return students;
}
