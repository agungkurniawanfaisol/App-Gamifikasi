import { LevelName, PrismaClient } from "@prisma/client";
import { getTopicsForLevel } from "./catalog";
import {
  LEGACY_GROUPS_PER_LEVEL,
  LEVEL_DATA,
  SEED_SCALE,
} from "./config";
import {
  generateGroupContent,
  padGroupToScale,
} from "./generators";
import type { ContentItem } from "./helpers";
import { LEGACY_GROUP_BUILDERS } from "./legacy-groups";

export interface SeedStats {
  totalItems: number;
  totalQuestions: number;
  totalSubQuestions: number;
  totalGroups: number;
}

function buildGroupContent(
  levelName: LevelName,
  topicIndex: number
): ContentItem[] {
  const topics = getTopicsForLevel(levelName);
  const topic = topics[topicIndex]!;
  const legacyBuilders = LEGACY_GROUP_BUILDERS[levelName];

  if (topicIndex < LEGACY_GROUPS_PER_LEVEL && legacyBuilders[topic.title]) {
    const legacyItems = legacyBuilders[topic.title]!();
    return padGroupToScale(legacyItems, topic);
  }

  return generateGroupContent(topic);
}

async function persistGroupItems(
  prisma: PrismaClient,
  groupId: number,
  items: ContentItem[]
) {
  await prisma.$transaction(async (tx) => {
    await tx.groupContentItem.deleteMany({ where: { groupId } });

    for (const item of items) {
      if (item.type === "MATERIAL") {
        await tx.groupContentItem.create({
          data: {
            groupId,
            type: "MATERIAL",
            order: item.order,
            title: item.title ?? null,
            content: item.content ?? null,
          },
        });
      } else {
        await tx.groupContentItem.create({
          data: {
            groupId,
            type: "QUESTION",
            order: item.order,
            title: null,
            content: null,
            questionText: item.questionText ?? null,
            skill: item.skill ?? null,
            format: item.format ?? null,
            options: item.options ?? undefined,
            correctAnswer: item.correctAnswer ?? null,
            expectedSpeech: item.expectedSpeech ?? null,
            audioUrl: item.audioUrl ?? null,
            explanation: item.explanation ?? null,
            essayRubric: item.essayRubric ?? null,
            subQuestions: item.subQuestions ?? undefined,
          },
        });
      }
    }
  });
}

async function seedLevel(
  prisma: PrismaClient,
  levelId: number,
  levelName: LevelName
): Promise<SeedStats> {
  const topics = getTopicsForLevel(levelName);
  let totalItems = 0;
  let totalQuestions = 0;
  let totalSubQuestions = 0;

  await prisma.learningGroup.deleteMany({
    where: {
      levelId,
      order: { gt: SEED_SCALE.groupsPerLevel },
    },
  });

  for (let gi = 0; gi < topics.length; gi++) {
    const topic = topics[gi]!;
    const items = buildGroupContent(levelName, gi);

    let group = await prisma.learningGroup.findFirst({
      where: { levelId, order: gi + 1 },
    });

    if (!group) {
      group = await prisma.learningGroup.create({
        data: {
          levelId,
          title: topic.title,
          order: gi + 1,
          isPublished: true,
        },
      });
    } else if (group.title !== topic.title) {
      group = await prisma.learningGroup.update({
        where: { id: group.id },
        data: { title: topic.title, isPublished: true },
      });
    }

    await persistGroupItems(prisma, group.id, items);

    const questionCount = items.filter((i) => i.type === "QUESTION").length;
    const subCount = items
      .filter((i) => i.type === "QUESTION")
      .reduce((sum, i) => sum + (i.subQuestions as unknown[]).length, 0);

    totalItems += items.length;
    totalQuestions += questionCount;
    totalSubQuestions += subCount;

    console.log(
      `  ✅ Group "${topic.title}" — ${items.length} items (${items.length - questionCount}M + ${questionCount}Q)`
    );
  }

  return {
    totalItems,
    totalQuestions,
    totalSubQuestions,
    totalGroups: topics.length,
  };
}

export async function seedLevels(prisma: PrismaClient): Promise<SeedStats> {
  const levels: { name: LevelName; id: number }[] = [];

  for (const data of LEVEL_DATA) {
    const level = await prisma.level.upsert({
      where: { name: data.name },
      update: { description: data.description },
      create: data,
    });
    levels.push({ name: level.name as LevelName, id: level.id });
  }
  console.log("  ✅ Levels created");

  let grandTotalItems = 0;
  let grandTotalQuestions = 0;
  let grandTotalSubQuestions = 0;
  let grandTotalGroups = 0;

  for (const level of levels) {
    console.log(`\n📘 Seeding ${level.name}...`);
    const stats = await seedLevel(prisma, level.id, level.name);
    grandTotalItems += stats.totalItems;
    grandTotalQuestions += stats.totalQuestions;
    grandTotalSubQuestions += stats.totalSubQuestions;
    grandTotalGroups += stats.totalGroups;
  }

  return {
    totalItems: grandTotalItems,
    totalQuestions: grandTotalQuestions,
    totalSubQuestions: grandTotalSubQuestions,
    totalGroups: grandTotalGroups,
  };
}
