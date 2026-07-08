"use server";

import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { isProgramComplete } from "@/lib/achievement-engine";
import { getUserCertificates } from "@/lib/certificate-service";
import { getLevelLabel } from "@/lib/labels";
import { getBatchLevelProgressSummaries } from "@/lib/progression";
import { prisma } from "@/lib/prisma";
import type { LevelName } from "@prisma/client";

export type CertificateLevelProgress = {
  levelId: number;
  levelName: LevelName;
  levelLabel: string;
  completed: number;
  total: number;
  isComplete: boolean;
};

export async function getCertificatesOverview() {
  const session = await requireStudent();
  const userId = getUserId(session);

  const levels = await prisma.level.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });
  const levelIds = levels.map((level) => level.id);

  const [certificates, progressByLevel, programComplete] = await Promise.all([
    getUserCertificates(userId),
    getBatchLevelProgressSummaries(userId, levelIds),
    isProgramComplete(userId),
  ]);

  const levelProgress: CertificateLevelProgress[] = levels.map((level) => {
    const summary = progressByLevel.get(level.id) ?? { completed: 0, total: 0 };
    return {
      levelId: level.id,
      levelName: level.name,
      levelLabel: getLevelLabel(level.name),
      completed: summary.completed,
      total: summary.total,
      isComplete: summary.total > 0 && summary.completed === summary.total,
    };
  });

  const hasGraduationCert = certificates.some(
    (certificate) => certificate.template.slug === "cert-graduation"
  );

  return {
    certificates,
    levelProgress,
    programComplete,
    hasGraduationCert,
  };
}
