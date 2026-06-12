import { ContentItemType, QuestionSkill, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getLevelLabel } from "@/lib/labels";

export type AdminAnalyticsSnapshot = {
  activity: {
    activeLast7Days: number;
    activeLast30Days: number;
    inactiveCount: number;
    totalStudents: number;
  };
  levelCompletion: Array<{
    levelId: number;
    levelName: string;
    totalGroups: number;
    publishedGroups: number;
    completionRate: number;
  }>;
  groupCompletion: Array<{
    groupId: number;
    groupTitle: string;
    levelName: string;
    startedCount: number;
    completedCount: number;
    completionRate: number;
    avgScore: number | null;
  }>;
  questionDifficulty: Array<{
    contentItemId: number;
    label: string;
    groupTitle: string;
    skill: QuestionSkill | null;
    attempts: number;
    successRate: number;
  }>;
  skillHeatmap: Array<{
    skill: QuestionSkill;
    attempts: number;
    successRate: number;
  }>;
  dropOff: Array<{
    groupId: number;
    groupTitle: string;
    levelName: string;
    totalItems: number;
    stuckCount: number;
  }>;
};

async function countActiveStudents(since: Date): Promise<number> {
  const rows = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(DISTINCT user_id) AS count FROM (
      SELECT ua.user_id
      FROM user_answers ua
      INNER JOIN users u ON u.id = ua.user_id
      WHERE u.role = ${Role.STUDENT} AND ua.created_at >= ${since}
      UNION
      SELECT uaa.user_id
      FROM user_assessment_answers uaa
      INNER JOIN users u ON u.id = uaa.user_id
      WHERE u.role = ${Role.STUDENT} AND uaa.created_at >= ${since}
      UNION
      SELECT up.user_id
      FROM user_progress up
      INNER JOIN users u ON u.id = up.user_id
      WHERE u.role = ${Role.STUDENT}
        AND (up.started_at >= ${since} OR up.completed_at >= ${since})
    ) active_users
  `;

  return Number(rows[0]?.count ?? 0);
}

function completionPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export async function buildAdminAnalyticsSnapshot(): Promise<AdminAnalyticsSnapshot> {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [
    totalStudents,
    activeLast7Days,
    activeLast30Days,
    levels,
    groups,
    progressRows,
    answerAgg,
    contentItems,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.STUDENT, isActive: true } }),
    countActiveStudents(sevenDaysAgo),
    countActiveStudents(thirtyDaysAgo),
    prisma.level.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
    prisma.learningGroup.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        levelId: true,
        level: { select: { name: true } },
        _count: { select: { contentItems: true } },
      },
      orderBy: [{ level: { order: "asc" } }, { order: "asc" }],
    }),
    prisma.userProgress.findMany({
      where: { user: { role: Role.STUDENT } },
      select: {
        groupId: true,
        isGroupCompleted: true,
        groupScorePercent: true,
        lastContentItemId: true,
      },
    }),
    prisma.userAnswer.groupBy({
      by: ["contentItemId", "isCorrect"],
      _count: { _all: true },
    }),
    prisma.groupContentItem.findMany({
      where: { type: ContentItemType.QUESTION },
      select: {
        id: true,
        questionText: true,
        skill: true,
        group: { select: { title: true } },
      },
    }),
  ]);

  const progressByGroup = new Map<
    number,
    {
      started: number;
      completed: number;
      scoreSum: number;
      scoreCount: number;
      stuck: number;
    }
  >();

  for (const row of progressRows) {
    const entry = progressByGroup.get(row.groupId) ?? {
      started: 0,
      completed: 0,
      scoreSum: 0,
      scoreCount: 0,
      stuck: 0,
    };
    entry.started += 1;
    if (row.isGroupCompleted) {
      entry.completed += 1;
      if (row.groupScorePercent != null) {
        entry.scoreSum += row.groupScorePercent;
        entry.scoreCount += 1;
      }
    } else if (row.lastContentItemId != null) {
      entry.stuck += 1;
    }
    progressByGroup.set(row.groupId, entry);
  }

  const groupsByLevel = new Map<number, typeof groups>();
  for (const group of groups) {
    const list = groupsByLevel.get(group.levelId) ?? [];
    list.push(group);
    groupsByLevel.set(group.levelId, list);
  }

  const levelCompletion = levels.map((level) => {
    const levelGroups = groupsByLevel.get(level.id) ?? [];
    let started = 0;
    let completed = 0;
    for (const group of levelGroups) {
      const stats = progressByGroup.get(group.id);
      if (!stats) continue;
      started += stats.started;
      completed += stats.completed;
    }
    return {
      levelId: level.id,
      levelName: getLevelLabel(level.name),
      totalGroups: levelGroups.length,
      publishedGroups: levelGroups.length,
      completionRate: completionPercent(completed, started),
    };
  });

  const groupCompletion = groups.map((group) => {
    const stats = progressByGroup.get(group.id) ?? {
      started: 0,
      completed: 0,
      scoreSum: 0,
      scoreCount: 0,
      stuck: 0,
    };
    return {
      groupId: group.id,
      groupTitle: group.title,
      levelName: getLevelLabel(group.level.name),
      startedCount: stats.started,
      completedCount: stats.completed,
      completionRate: completionPercent(stats.completed, stats.started),
      avgScore:
        stats.scoreCount > 0
          ? Math.round(stats.scoreSum / stats.scoreCount)
          : null,
    };
  });

  const attemptsByItem = new Map<number, { attempts: number; correct: number }>();
  for (const row of answerAgg) {
    const entry = attemptsByItem.get(row.contentItemId) ?? {
      attempts: 0,
      correct: 0,
    };
    entry.attempts += row._count._all;
    if (row.isCorrect) entry.correct += row._count._all;
    attemptsByItem.set(row.contentItemId, entry);
  }

  const questionDifficulty = contentItems
    .map((item) => {
      const stats = attemptsByItem.get(item.id) ?? { attempts: 0, correct: 0 };
      return {
        contentItemId: item.id,
        label: item.questionText?.trim() || `Question #${item.id}`,
        groupTitle: item.group.title,
        skill: item.skill,
        attempts: stats.attempts,
        successRate: completionPercent(stats.correct, stats.attempts),
      };
    })
    .filter((row) => row.attempts > 0)
    .sort((a, b) => a.successRate - b.successRate)
    .slice(0, 25);

  const skillStats = new Map<QuestionSkill, { attempts: number; correct: number }>();
  for (const item of contentItems) {
    if (!item.skill) continue;
    const stats = attemptsByItem.get(item.id);
    if (!stats || stats.attempts === 0) continue;
    const entry = skillStats.get(item.skill) ?? { attempts: 0, correct: 0 };
    entry.attempts += stats.attempts;
    entry.correct += stats.correct;
    skillStats.set(item.skill, entry);
  }

  const skillHeatmap = Object.values(QuestionSkill).map((skill) => {
    const stats = skillStats.get(skill) ?? { attempts: 0, correct: 0 };
    return {
      skill,
      attempts: stats.attempts,
      successRate: completionPercent(stats.correct, stats.attempts),
    };
  });

  const dropOff = groups
    .map((group) => {
      const stats = progressByGroup.get(group.id);
      return {
        groupId: group.id,
        groupTitle: group.title,
        levelName: getLevelLabel(group.level.name),
        totalItems: group._count.contentItems,
        stuckCount: stats?.stuck ?? 0,
      };
    })
    .filter((row) => row.stuckCount > 0)
    .sort((a, b) => b.stuckCount - a.stuckCount)
    .slice(0, 20);

  return {
    activity: {
      activeLast7Days,
      activeLast30Days,
      inactiveCount: Math.max(0, totalStudents - activeLast30Days),
      totalStudents,
    },
    levelCompletion,
    groupCompletion,
    questionDifficulty,
    skillHeatmap,
    dropOff,
  };
}
