import { AssessmentPhase, PrismaClient } from "@prisma/client";

const PRETEST_TEMPLATES = [
  "I already understand the main ideas of this topic.",
  "I feel confident using the vocabulary in this group.",
  "I can explain this topic to a friend in English.",
];

const POSTTEST_TEMPLATES = [
  "I understand the main ideas of this topic better now.",
  "I feel more confident using the vocabulary from this group.",
  "I can explain this topic to a friend in English more clearly.",
];

export async function seedGroupAssessments(prisma: PrismaClient) {
  const groups = await prisma.learningGroup.findMany({
    select: { id: true, title: true },
    orderBy: [{ levelId: "asc" }, { order: "asc" }],
  });

  let totalQuestions = 0;

  for (const group of groups) {
    await prisma.groupAssessmentQuestion.deleteMany({
      where: { groupId: group.id },
    });

    for (let i = 0; i < PRETEST_TEMPLATES.length; i++) {
      await prisma.groupAssessmentQuestion.create({
        data: {
          groupId: group.id,
          phase: AssessmentPhase.PRETEST,
          order: i + 1,
          questionText: `${PRETEST_TEMPLATES[i]} (${group.title})`,
        },
      });
      totalQuestions++;
    }

    for (let i = 0; i < POSTTEST_TEMPLATES.length; i++) {
      await prisma.groupAssessmentQuestion.create({
        data: {
          groupId: group.id,
          phase: AssessmentPhase.POSTTEST,
          order: i + 1,
          questionText: `${POSTTEST_TEMPLATES[i]} (${group.title})`,
        },
      });
      totalQuestions++;
    }
  }

  console.log(
    `  ✅ Assessment questions: ${totalQuestions} (${groups.length} groups × 6)`
  );
}
