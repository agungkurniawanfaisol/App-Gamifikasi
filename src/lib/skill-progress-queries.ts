import { ContentItemType, QuestionSkill } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getProficiencySummary } from "@/lib/proficiency-queries";
import { getBatchGroupStepProgress } from "@/lib/progression";
import {
  buildAnswerKey,
  buildSkillProgressStat,
  emptySkillStats,
  expandContentItemToSkillSlots,
  type LearningProgressSummary,
  type MaterialProgressStat,
  SKILL_ORDER,
} from "@/lib/skill-progress";

export async function getMaterialProgressSummary(
  userId: number
): Promise<MaterialProgressStat> {
  const groups = await prisma.learningGroup.findMany({
    where: { isPublished: true },
    select: { id: true },
  });

  if (groups.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }

  const groupIds = groups.map((g) => g.id);
  const stepProgressMap = await getBatchGroupStepProgress(userId, groupIds);

  let completed = 0;
  let total = 0;

  for (const groupId of groupIds) {
    const progress = stepProgressMap.get(groupId) ?? {
      completed: 0,
      total: 0,
      percent: 0,
    };
    completed += progress.completed;
    total += progress.total;
  }

  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export async function getSkillProgressStats(
  userId: number
): Promise<ReturnType<typeof buildSkillProgressStat>[]> {
  const [contentItems, answers] = await Promise.all([
    prisma.groupContentItem.findMany({
      where: {
        type: ContentItemType.QUESTION,
        group: { isPublished: true },
      },
      select: {
        id: true,
        type: true,
        skill: true,
        subQuestions: true,
        questionText: true,
        format: true,
        options: true,
        correctAnswer: true,
        expectedSpeech: true,
        audioUrl: true,
        explanation: true,
        essayRubric: true,
      },
    }),
    prisma.userAnswer.findMany({
      where: { userId },
      select: {
        contentItemId: true,
        subQuestionIndex: true,
        isCorrect: true,
      },
    }),
  ]);

  const totals = new Map<QuestionSkill, number>();
  for (const skill of SKILL_ORDER) {
    totals.set(skill, 0);
  }

  for (const item of contentItems) {
    for (const slot of expandContentItemToSkillSlots(item)) {
      totals.set(slot.skill, (totals.get(slot.skill) ?? 0) + 1);
    }
  }

  const attempted = new Map<QuestionSkill, number>();
  const correct = new Map<QuestionSkill, number>();
  const answeredKeys = new Set<string>();

  for (const answer of answers) {
    const item = contentItems.find((entry) => entry.id === answer.contentItemId);
    if (!item) continue;

    const slots = expandContentItemToSkillSlots(item);
    const slot = slots[answer.subQuestionIndex];
    if (!slot) continue;

    const key = buildAnswerKey(answer.contentItemId, answer.subQuestionIndex);
    if (answeredKeys.has(key)) continue;
    answeredKeys.add(key);

    attempted.set(slot.skill, (attempted.get(slot.skill) ?? 0) + 1);
    if (answer.isCorrect) {
      correct.set(slot.skill, (correct.get(slot.skill) ?? 0) + 1);
    }
  }

  return SKILL_ORDER.map((skill) =>
    buildSkillProgressStat(
      skill,
      attempted.get(skill) ?? 0,
      totals.get(skill) ?? 0,
      correct.get(skill) ?? 0
    )
  );
}

export async function getLearningProgressSummary(
  userId: number
): Promise<LearningProgressSummary> {
  const [material, proficiency, skills] = await Promise.all([
    getMaterialProgressSummary(userId),
    getProficiencySummary(userId),
    getSkillProgressStats(userId),
  ]);

  return {
    material,
    proficiency,
    skills: skills.length > 0 ? skills : emptySkillStats(),
  };
}
