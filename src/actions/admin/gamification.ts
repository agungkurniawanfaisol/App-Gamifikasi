"use server";

import { revalidatePath } from "next/cache";
import {
  AchievementTriggerType,
  ChallengeRecurrence,
  RewardType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { POINT_VALUES } from "@/lib/points";

const POINT_VALUES_KEY = "point_values";

type PointValuesConfig = {
  materialComplete: number;
  correctAnswer: number;
  onTimeBonus: number;
  discussionMilestone: number;
  groupComplete: number;
};

function defaultPointValues(): PointValuesConfig {
  return {
    materialComplete: POINT_VALUES.MATERIAL_COMPLETE,
    correctAnswer: POINT_VALUES.CORRECT_ANSWER,
    onTimeBonus: POINT_VALUES.ON_TIME_BONUS,
    discussionMilestone: POINT_VALUES.DISCUSSION_MILESTONE,
    groupComplete: POINT_VALUES.GROUP_COMPLETE,
  };
}

function parsePointValues(raw: unknown): PointValuesConfig {
  const defaults = defaultPointValues();
  if (!raw || typeof raw !== "object") return defaults;
  const value = raw as Record<string, unknown>;
  const read = (key: keyof PointValuesConfig) => {
    const n = Number(value[key]);
    return Number.isFinite(n) && n >= 0 ? n : defaults[key];
  };
  return {
    materialComplete: read("materialComplete"),
    correctAnswer: read("correctAnswer"),
    onTimeBonus: read("onTimeBonus"),
    discussionMilestone: read("discussionMilestone"),
    groupComplete: read("groupComplete"),
  };
}

async function loadPointValues(): Promise<PointValuesConfig> {
  const row = await prisma.appSetting.findUnique({
    where: { key: POINT_VALUES_KEY },
    select: { value: true },
  });
  return parsePointValues(row?.value);
}

function revalidateGamification() {
  revalidatePath("/admin/gamification");
}

export async function getGamificationOverview() {
  await requireAdmin();

  const [challenges, achievements, certificates, pointValues] =
    await Promise.all([
      prisma.challengeTemplate.findMany({
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          pointReward: true,
          isActive: true,
        },
      }),
      prisma.achievementDefinition.findMany({
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          isActive: true,
        },
      }),
      prisma.certificateTemplate.findMany({
        orderBy: [{ id: "asc" }],
        select: {
          id: true,
          title: true,
          subtitle: true,
          isActive: true,
          level: { select: { name: true } },
        },
      }),
      loadPointValues(),
    ]);

  return {
    challenges,
    achievements,
    certificates,
    pointValues,
  };
}

export async function createChallengeTemplate(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const recurrence = String(formData.get("recurrence") ?? ChallengeRecurrence.DAILY);
  const pointReward = parseInt(String(formData.get("pointReward") ?? "20"), 10);

  if (!title || !slug) return;

  const maxOrder = await prisma.challengeTemplate.aggregate({
    _max: { sortOrder: true },
  });

  await prisma.challengeTemplate.create({
    data: {
      title,
      slug,
      description: description || title,
      recurrence:
        recurrence === ChallengeRecurrence.WEEKLY
          ? ChallengeRecurrence.WEEKLY
          : ChallengeRecurrence.DAILY,
      pointReward: Number.isFinite(pointReward) ? Math.max(0, pointReward) : 20,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      objectives: [
        {
          type: "COMPLETE_MATERIALS",
          target: 3,
          label: "Complete learning materials",
        },
      ],
    },
  });

  revalidateGamification();
}

export async function createAchievementDefinition(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const groupsCompleted = parseInt(
    String(formData.get("groupsCompleted") ?? "1"),
    10
  );
  const bonusPoints = parseInt(String(formData.get("bonusPoints") ?? "15"), 10);

  if (!title || !slug) return;

  const maxOrder = await prisma.achievementDefinition.aggregate({
    _max: { sortOrder: true },
  });

  await prisma.achievementDefinition.create({
    data: {
      title,
      slug,
      description: description || title,
      triggerType: AchievementTriggerType.GROUP_COMPLETE,
      triggerConfig: {
        groupsCompleted: Number.isFinite(groupsCompleted)
          ? Math.max(1, groupsCompleted)
          : 1,
      },
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      rewards: {
        create: {
          rewardType: RewardType.BONUS_POINTS,
          rewardConfig: {
            points: Number.isFinite(bonusPoints) ? Math.max(0, bonusPoints) : 15,
          },
        },
      },
    },
  });

  revalidateGamification();
}

export async function toggleChallengeActive(id: number) {
  await requireAdmin();
  const row = await prisma.challengeTemplate.findUnique({
    where: { id },
    select: { isActive: true },
  });
  if (!row) return;
  await prisma.challengeTemplate.update({
    where: { id },
    data: { isActive: !row.isActive },
  });
  revalidateGamification();
}

export async function toggleAchievementActive(id: number) {
  await requireAdmin();
  const row = await prisma.achievementDefinition.findUnique({
    where: { id },
    select: { isActive: true },
  });
  if (!row) return;
  await prisma.achievementDefinition.update({
    where: { id },
    data: { isActive: !row.isActive },
  });
  revalidateGamification();
}

export async function toggleCertificateActive(id: number) {
  await requireAdmin();
  const row = await prisma.certificateTemplate.findUnique({
    where: { id },
    select: { isActive: true },
  });
  if (!row) return;
  await prisma.certificateTemplate.update({
    where: { id },
    data: { isActive: !row.isActive },
  });
  revalidateGamification();
}

export async function updateChallengeReward(id: number, pointReward: number) {
  await requireAdmin();
  if (!Number.isFinite(pointReward) || pointReward < 0) return;
  await prisma.challengeTemplate.update({
    where: { id },
    data: { pointReward },
  });
  revalidateGamification();
}

export async function savePointValues(values: PointValuesConfig) {
  await requireAdmin();
  await prisma.appSetting.upsert({
    where: { key: POINT_VALUES_KEY },
    create: { key: POINT_VALUES_KEY, value: values },
    update: { value: values },
  });
  revalidateGamification();
}

export async function deleteChallengeTemplate(id: number): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    const row = await prisma.challengeTemplate.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!row) return { ok: false };
    await prisma.challengeTemplate.delete({ where: { id } });
    revalidateGamification();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deleteAchievementDefinition(
  id: number
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    const row = await prisma.achievementDefinition.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!row) return { ok: false };
    await prisma.achievementDefinition.delete({ where: { id } });
    revalidateGamification();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deleteCertificateTemplate(
  id: number
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    const row = await prisma.certificateTemplate.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!row) return { ok: false };
    await prisma.certificateTemplate.delete({ where: { id } });
    revalidateGamification();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function resetPointValues(): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    const defaults = defaultPointValues();
    await prisma.appSetting.upsert({
      where: { key: POINT_VALUES_KEY },
      create: { key: POINT_VALUES_KEY, value: defaults },
      update: { value: defaults },
    });
    revalidateGamification();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
