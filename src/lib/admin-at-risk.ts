import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AtRiskReason = "stuck" | "inactive" | "overdue" | "low_accuracy";

export type AtRiskStudent = {
  userId: number;
  name: string;
  detail: string;
  reasons: AtRiskReason[];
};

const INACTIVE_DAYS = 14;

export async function getAtRiskStudents(limit = 10): Promise<AtRiskStudent[]> {
  const inactiveSince = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();

  const [students, stuckRows, overdueGroups] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.STUDENT, isActive: true },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        progress: {
          where: { isGroupCompleted: false, lastContentItemId: { not: null } },
          select: {
            group: { select: { title: true, dueAt: true } },
            startedAt: true,
          },
          take: 1,
        },
        answers: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { isCorrect: true, createdAt: true },
        },
      },
      take: 100,
    }),
    prisma.userProgress.findMany({
      where: {
        isGroupCompleted: false,
        lastContentItemId: { not: null },
        user: { role: Role.STUDENT, isActive: true },
      },
      select: {
        userId: true,
        group: { select: { title: true } },
      },
      take: 50,
    }),
    prisma.learningGroup.findMany({
      where: {
        isPublished: true,
        dueAt: { lt: now },
      },
      select: {
        id: true,
        title: true,
        progress: {
          where: { isGroupCompleted: false },
          select: { userId: true },
        },
      },
    }),
  ]);

  const stuckByUser = new Map<number, string>();
  for (const row of stuckRows) {
    if (!stuckByUser.has(row.userId)) {
      stuckByUser.set(row.userId, row.group.title);
    }
  }

  const overdueByUser = new Map<number, string>();
  for (const group of overdueGroups) {
    for (const progress of group.progress) {
      if (!overdueByUser.has(progress.userId)) {
        overdueByUser.set(progress.userId, group.title);
      }
    }
  }

  const results: AtRiskStudent[] = [];

  for (const student of students) {
    const reasons: AtRiskReason[] = [];
    const details: string[] = [];

    if (stuckByUser.has(student.id)) {
      reasons.push("stuck");
      details.push(stuckByUser.get(student.id)!);
    }

    const lastAnswer = student.answers[0]?.createdAt ?? student.updatedAt;
    if (lastAnswer < inactiveSince) {
      reasons.push("inactive");
      details.push("No recent activity");
    }

    if (overdueByUser.has(student.id)) {
      reasons.push("overdue");
      details.push(overdueByUser.get(student.id)!);
    }

    const recentAnswers = student.answers.slice(0, 10);
    if (recentAnswers.length >= 5) {
      const correct = recentAnswers.filter((a) => a.isCorrect).length;
      const rate = correct / recentAnswers.length;
      if (rate < 0.5) {
        reasons.push("low_accuracy");
        details.push(`${Math.round(rate * 100)}% recent accuracy`);
      }
    }

    if (reasons.length === 0) continue;

    results.push({
      userId: student.id,
      name: student.name,
      detail: details[0] ?? "Needs attention",
      reasons,
    });
  }

  return results.slice(0, limit);
}
