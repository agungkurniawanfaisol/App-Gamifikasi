import { prisma } from "@/lib/prisma";
import { getLevelLabel } from "@/lib/labels";

export type TestimonialListItem = {
  id: number;
  studentName: string;
  studentEmail: string;
  levelLabel: string;
  groupTitle: string;
  groupId: number;
  levelId: number;
  scorePercent: number | null;
  rating: number;
  testimonialText: string;
  aiFeedback: string | null;
  submittedAt: Date;
};

export async function getGroupTestimonials(options?: {
  groupId?: number;
  search?: string;
}): Promise<TestimonialListItem[]> {
  const search = options?.search?.trim();

  const rows = await prisma.userProgress.findMany({
    where: {
      testimonialSubmittedAt: { not: null },
      ...(options?.groupId ? { groupId: options.groupId } : {}),
      ...(search
        ? {
            user: {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
              ],
            },
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      group: {
        select: {
          id: true,
          title: true,
          levelId: true,
          level: { select: { name: true } },
        },
      },
    },
    orderBy: { testimonialSubmittedAt: "desc" },
    take: 200,
  });

  return rows
    .filter((row) => row.testimonialRating != null && row.testimonialText)
    .map((row) => ({
      id: row.id,
      studentName: row.user.name,
      studentEmail: row.user.email,
      levelLabel: getLevelLabel(row.group.level.name),
      groupTitle: row.group.title,
      groupId: row.group.id,
      levelId: row.group.levelId,
      scorePercent: row.groupScorePercent,
      rating: row.testimonialRating!,
      testimonialText: row.testimonialText!,
      aiFeedback: row.aiCompletionFeedback,
      submittedAt: row.testimonialSubmittedAt!,
    }));
}

export async function getTestimonialGroupOptions() {
  const groups = await prisma.learningGroup.findMany({
    where: {
      progress: {
        some: { testimonialSubmittedAt: { not: null } },
      },
    },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  return groups;
}
