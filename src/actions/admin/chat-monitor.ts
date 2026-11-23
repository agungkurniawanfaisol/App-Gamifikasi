"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { chatMonitorDateRange, type ChatMonitorDatePreset } from "@/lib/chat-day";
import { prisma } from "@/lib/prisma";
import type { ChatRole, Prisma } from "@prisma/client";

export type ChatMonitorEntry = {
  id: number;
  userId: number;
  userName: string;
  groupId: number | null;
  groupTitle: string | null;
  role: ChatRole;
  message: string;
  createdAt: string;
};

export type ChatConversationMessage = {
  id: number;
  role: ChatRole;
  message: string;
  createdAt: string;
};

export type ChatConversationDetail = {
  userId: number;
  userName: string;
  userEmail: string;
  groupId: number | null;
  groupTitle: string | null;
  messages: ChatConversationMessage[];
};

type GetChatMonitorEntriesInput = {
  take?: number;
  studentId?: number;
  datePreset?: ChatMonitorDatePreset;
};

const CONVERSATION_MESSAGE_LIMIT = 500;

function buildDateWhere(
  datePreset: ChatMonitorDatePreset
): Prisma.ChatHistoryWhereInput {
  const { from, to } = chatMonitorDateRange(datePreset);
  if (!from && !to) return {};
  return {
    createdAt: {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    },
  };
}

export async function getChatMonitorEntries(
  input: GetChatMonitorEntriesInput = {}
): Promise<{ entries: ChatMonitorEntry[] }> {
  await requireAdmin();

  const take = Math.min(Math.max(input.take ?? 200, 1), 500);
  const dateWhere = buildDateWhere(input.datePreset ?? "all");

  const rows = await prisma.chatHistory.findMany({
    where: {
      user: { role: "STUDENT" },
      ...(input.studentId != null ? { userId: input.studentId } : {}),
      ...dateWhere,
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
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

export async function getChatConversationDetail(input: {
  userId: number;
  groupId: number | null;
  datePreset?: ChatMonitorDatePreset;
}): Promise<ChatConversationDetail | null> {
  await requireAdmin();

  if (!Number.isFinite(input.userId) || input.userId <= 0) {
    return null;
  }

  const dateWhere = buildDateWhere(input.datePreset ?? "all");

  const user = await prisma.user.findFirst({
    where: { id: input.userId, role: "STUDENT" },
    select: { id: true, name: true, email: true },
  });
  if (!user) return null;

  let groupTitle: string | null = null;
  if (input.groupId != null) {
    const group = await prisma.learningGroup.findUnique({
      where: { id: input.groupId },
      select: { title: true },
    });
    if (!group) return null;
    groupTitle = group.title;
  }

  const rows = await prisma.chatHistory.findMany({
    where: {
      userId: input.userId,
      groupId: input.groupId,
      ...dateWhere,
    },
    orderBy: { createdAt: "asc" },
    take: CONVERSATION_MESSAGE_LIMIT,
    select: {
      id: true,
      role: true,
      message: true,
      createdAt: true,
    },
  });

  return {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    groupId: input.groupId,
    groupTitle,
    messages: rows.map((row) => ({
      id: row.id,
      role: row.role,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
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
