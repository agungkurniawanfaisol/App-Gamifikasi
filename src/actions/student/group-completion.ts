"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { computeGroupScore } from "@/lib/group-completion";
import { buildGroupCompletionPrompt, generateFeedback } from "@/lib/ollama";
import { getLevelLabel, labels } from "@/lib/labels";
import { markGroupCompleted } from "@/actions/student/progress";

const TESTIMONIAL_MIN_LENGTH = 20;

function revalidateLearnPaths(levelId: number, groupId: number) {
  revalidatePath(`/dashboard/learn/${levelId}`);
  revalidatePath(`/dashboard/learn/${levelId}/${groupId}`);
  revalidatePath("/admin/testimonials");
}

export async function prepareGroupCompletion(groupId: number, levelId: number) {
  const session = await requireStudent();
  const userId = getUserId(session);

  const group = await prisma.learningGroup.findFirst({
    where: { id: groupId, levelId, isPublished: true },
    include: { level: { select: { name: true } } },
  });

  if (!group) {
    throw new Error("Group not found.");
  }

  const progress = await prisma.userProgress.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: {
      groupScorePercent: true,
      aiCompletionFeedback: true,
      testimonialSubmittedAt: true,
    },
  });

  if (progress?.testimonialSubmittedAt) {
    return {
      scorePercent: progress.groupScorePercent ?? 0,
      aiFeedback: progress.aiCompletionFeedback ?? labels.api.feedbackUnavailable,
      testimonialSubmitted: true,
    };
  }

  if (
    progress?.groupScorePercent != null &&
    progress.aiCompletionFeedback != null
  ) {
    return {
      scorePercent: progress.groupScorePercent,
      aiFeedback: progress.aiCompletionFeedback,
      testimonialSubmitted: false,
    };
  }

  const breakdown = await computeGroupScore(userId, groupId);
  const levelLabel = getLevelLabel(group.level.name);
  const prompt = buildGroupCompletionPrompt({
    groupTitle: group.title,
    levelLabel,
    scorePercent: breakdown.scorePercent,
    totalQuestions: breakdown.totalQuestions,
    answeredQuestions: breakdown.answeredQuestions,
    correctSubAnswers: breakdown.correctSubAnswers,
    totalSubAnswers: breakdown.totalSubAnswers,
    skillSummary: breakdown.skillSummary,
  });

  let aiFeedback: string = labels.api.feedbackUnavailable;
  try {
    aiFeedback = await generateFeedback(prompt);
  } catch {
    aiFeedback = labels.api.feedbackUnavailable;
  }

  await prisma.userProgress.upsert({
    where: { userId_groupId: { userId, groupId } },
    create: {
      userId,
      groupId,
      groupScorePercent: breakdown.scorePercent,
      aiCompletionFeedback: aiFeedback,
    },
    update: {
      groupScorePercent: breakdown.scorePercent,
      aiCompletionFeedback: aiFeedback,
    },
  });

  revalidateLearnPaths(levelId, groupId);

  return {
    scorePercent: breakdown.scorePercent,
    aiFeedback,
    testimonialSubmitted: false,
  };
}

export async function submitGroupTestimonial(
  groupId: number,
  levelId: number,
  rating: number,
  text: string
) {
  const session = await requireStudent();
  const userId = getUserId(session);

  const trimmed = text.trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false as const, error: labels.student.testimonialRatingRequired };
  }
  if (trimmed.length < TESTIMONIAL_MIN_LENGTH) {
    return { ok: false as const, error: labels.student.testimonialMinLength };
  }

  const group = await prisma.learningGroup.findFirst({
    where: { id: groupId, levelId, isPublished: true },
    select: { id: true },
  });
  if (!group) {
    return { ok: false as const, error: "Group not found." };
  }

  const existing = await prisma.userProgress.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: {
      isGroupCompleted: true,
      testimonialSubmittedAt: true,
    },
  });

  if (existing?.testimonialSubmittedAt) {
    return { ok: false as const, error: labels.student.testimonialAlreadySubmitted };
  }

  const now = new Date();

  await prisma.userProgress.upsert({
    where: { userId_groupId: { userId, groupId } },
    create: {
      userId,
      groupId,
      testimonialRating: rating,
      testimonialText: trimmed,
      testimonialSubmittedAt: now,
    },
    update: {
      testimonialRating: rating,
      testimonialText: trimmed,
      testimonialSubmittedAt: now,
    },
  });

  let completionResult: Awaited<ReturnType<typeof markGroupCompleted>>;

  if (!existing?.isGroupCompleted) {
    completionResult = await markGroupCompleted(groupId, levelId);
  } else {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });
    completionResult = {
      pointsAdded: 0,
      onTimeBonus: 0,
      alreadyCompleted: true,
      newBadges: [],
      achievementGrants: [],
      totalPoints: user?.points ?? 0,
      challengeCompletions: [],
    };
  }

  revalidateLearnPaths(levelId, groupId);

  return {
    ok: true as const,
    ...completionResult,
  };
}
