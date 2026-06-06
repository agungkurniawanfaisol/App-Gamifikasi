import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CertificateMetadata = {
  userName: string;
  levelName: string;
  levelLabel: string;
  completedAt: string;
  proficiencyScore: number;
};

export async function generateCertificateNumber(): Promise<string> {
  const year = new Date().getUTCFullYear();
  const count = await prisma.userCertificate.count({
    where: {
      issuedAt: {
        gte: new Date(Date.UTC(year, 0, 1)),
        lt: new Date(Date.UTC(year + 1, 0, 1)),
      },
    },
  });
  return `NGF-${year}-${String(count + 1).padStart(6, "0")}`;
}

export async function issueCertificate(
  tx: Prisma.TransactionClient,
  input: {
    userId: number;
    templateSlug: string;
    achievementId: number;
    metadata: CertificateMetadata;
  }
): Promise<{ id: number; certificateNumber: string; templateTitle: string }> {
  const template = await tx.certificateTemplate.findFirst({
    where: { slug: input.templateSlug, isActive: true },
  });
  if (!template) {
    throw new Error(`Certificate template not found: ${input.templateSlug}`);
  }

  const existing = await tx.userCertificate.findFirst({
    where: {
      userId: input.userId,
      templateId: template.id,
    },
  });
  if (existing) {
    return {
      id: existing.id,
      certificateNumber: existing.certificateNumber,
      templateTitle: template.title,
    };
  }

  const certificateNumber = await generateCertificateNumber();
  const created = await tx.userCertificate.create({
    data: {
      userId: input.userId,
      templateId: template.id,
      achievementId: input.achievementId,
      certificateNumber,
      metadata: input.metadata,
    },
  });

  return {
    id: created.id,
    certificateNumber: created.certificateNumber,
    templateTitle: template.title,
  };
}

export async function getUserCertificates(userId: number) {
  return prisma.userCertificate.findMany({
    where: { userId },
    include: {
      template: { include: { level: true } },
      achievement: { select: { title: true, slug: true } },
    },
    orderBy: { issuedAt: "desc" },
  });
}

export async function getUserCertificateById(userId: number, certificateId: number) {
  return prisma.userCertificate.findFirst({
    where: { id: certificateId, userId },
    include: {
      template: { include: { level: true } },
      achievement: { select: { title: true, slug: true } },
    },
  });
}
