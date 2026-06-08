"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { isAssistantKnowledgeTableReady } from "@/lib/assistant-knowledge";
import {
  ASSISTANT_KNOWLEDGE_PAGE_SIZE,
  type AssistantKnowledgeListItem,
  type AssistantKnowledgeListResult,
} from "@/lib/assistant-knowledge-admin";

const entrySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers, and hyphens."),
  keywords: z.string().trim().min(1, "At least one keyword is required."),
  questionEn: z.string().trim().min(1, "English question is required."),
  questionId: z.string().trim().optional(),
  answerEn: z.string().trim().min(1, "English answer is required."),
  answerId: z.string().trim().optional(),
  priority: z.coerce.number().int().min(0).max(1000),
  isPublished: z.coerce.boolean(),
});

function parseKeywordsInput(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function mapRow(row: {
  id: number;
  slug: string;
  keywords: unknown;
  questionEn: string;
  questionId: string | null;
  answerEn: string;
  answerId: string | null;
  priority: number;
  isPublished: boolean;
  updatedAt: Date;
}): AssistantKnowledgeListItem {
  const keywords = Array.isArray(row.keywords)
    ? row.keywords.filter((item): item is string => typeof item === "string")
    : [];

  return { ...row, keywords };
}

function clampPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page, 1), totalPages);
}

export async function listAssistantKnowledgeEntriesPaginated(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<AssistantKnowledgeListResult> {
  await requireAdmin();

  const pageSize = options?.pageSize ?? ASSISTANT_KNOWLEDGE_PAGE_SIZE;
  const requestedPage = Math.max(1, options?.page ?? 1);
  const search = options?.search?.trim();

  if (!(await isAssistantKnowledgeTableReady())) {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 0,
    };
  }

  const where = search
    ? {
        OR: [
          { slug: { contains: search } },
          { questionEn: { contains: search } },
          { questionId: { contains: search } },
          { answerEn: { contains: search } },
          { answerId: { contains: search } },
        ],
      }
    : undefined;

  const total = await prisma.assistantKnowledge.count({ where });
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const page = clampPage(requestedPage, totalPages);

  const rows = await prisma.assistantKnowledge.findMany({
    where,
    orderBy: [{ priority: "desc" }, { slug: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      slug: true,
      keywords: true,
      questionEn: true,
      questionId: true,
      answerEn: true,
      answerId: true,
      priority: true,
      isPublished: true,
      updatedAt: true,
    },
  });

  return {
    items: rows.map(mapRow),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function createAssistantKnowledgeEntry(
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  if (!(await isAssistantKnowledgeTableReady())) {
    return {
      ok: false,
      error: "Assistant knowledge table is not ready. Run database migrations.",
    };
  }

  const parsed = entrySchema.safeParse({
    slug: formData.get("slug"),
    keywords: formData.get("keywords"),
    questionEn: formData.get("questionEn"),
    questionId: formData.get("questionId"),
    answerEn: formData.get("answerEn"),
    answerId: formData.get("answerId"),
    priority: formData.get("priority") ?? "0",
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const keywords = parseKeywordsInput(parsed.data.keywords);
  if (keywords.length === 0) {
    return { ok: false, error: "At least one keyword is required." };
  }

  try {
    await prisma.assistantKnowledge.create({
      data: {
        slug: parsed.data.slug,
        keywords,
        questionEn: parsed.data.questionEn,
        questionId: parsed.data.questionId?.trim() || null,
        answerEn: parsed.data.answerEn,
        answerId: parsed.data.answerId?.trim() || null,
        priority: parsed.data.priority,
        isPublished: parsed.data.isPublished,
      },
    });
  } catch {
    return { ok: false, error: "Could not create entry. Slug may already exist." };
  }

  revalidatePath("/admin/assistant-knowledge");
  return { ok: true };
}

export async function updateAssistantKnowledgeEntry(
  id: number,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  if (!(await isAssistantKnowledgeTableReady())) {
    return {
      ok: false,
      error: "Assistant knowledge table is not ready. Run database migrations.",
    };
  }

  const parsed = entrySchema.safeParse({
    slug: formData.get("slug"),
    keywords: formData.get("keywords"),
    questionEn: formData.get("questionEn"),
    questionId: formData.get("questionId"),
    answerEn: formData.get("answerEn"),
    answerId: formData.get("answerId"),
    priority: formData.get("priority") ?? "0",
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const keywords = parseKeywordsInput(parsed.data.keywords);
  if (keywords.length === 0) {
    return { ok: false, error: "At least one keyword is required." };
  }

  try {
    await prisma.assistantKnowledge.update({
      where: { id },
      data: {
        slug: parsed.data.slug,
        keywords,
        questionEn: parsed.data.questionEn,
        questionId: parsed.data.questionId?.trim() || null,
        answerEn: parsed.data.answerEn,
        answerId: parsed.data.answerId?.trim() || null,
        priority: parsed.data.priority,
        isPublished: parsed.data.isPublished,
      },
    });
  } catch {
    return { ok: false, error: "Could not update entry. Slug may already exist." };
  }

  revalidatePath("/admin/assistant-knowledge");
  return { ok: true };
}

export async function deleteAssistantKnowledgeEntry(
  id: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();

  try {
    await prisma.assistantKnowledge.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete entry." };
  }

  revalidatePath("/admin/assistant-knowledge");
  return { ok: true };
}

export async function toggleAssistantKnowledgePublish(
  id: number,
  isPublished: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();

  try {
    await prisma.assistantKnowledge.update({
      where: { id },
      data: { isPublished },
    });
  } catch {
    return { ok: false, error: "Could not update publish status." };
  }

  revalidatePath("/admin/assistant-knowledge");
  return { ok: true };
}
