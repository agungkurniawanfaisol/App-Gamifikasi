import { LevelName, PrismaClient } from "@prisma/client";

export async function seedStudentProgress(prisma: PrismaClient) {
  const student = await prisma.user.findUnique({
    where: { email: "student@gamifikasi.com" },
  });
  if (!student) {
    console.log("  ⚠️  Student not found, skipping progress seed");
    return;
  }

  await prisma.userAnswer.deleteMany({
    where: { userId: student.id },
  });
  await prisma.userAssessmentAnswer.deleteMany({
    where: { userId: student.id },
  });
  await prisma.userProgress.deleteMany({
    where: { userId: student.id },
  });
  await prisma.user.update({
    where: { id: student.id },
    data: { points: 0 },
  });

  const basicLevel = await prisma.level.findUnique({
    where: { name: LevelName.BASIC },
  });
  if (!basicLevel) return;

  const groups = await prisma.learningGroup.findMany({
    where: { levelId: basicLevel.id },
    orderBy: { order: "asc" },
    take: 2,
  });

  if (groups.length < 2) {
    console.log("  ⚠️  Not enough BASIC groups for progress seed");
    return;
  }

  const [g1, g2] = groups;
  let totalAnswers = 0;
  let totalPoints = 0;

  const g1ContentItems = await prisma.groupContentItem.findMany({
    where: { groupId: g1.id },
    orderBy: { order: "asc" },
  });

  if (g1ContentItems.length > 0) {
    await prisma.userProgress.upsert({
      where: { userId_groupId: { userId: student.id, groupId: g1.id } },
      update: {
        isGroupCompleted: true,
        completedAt: new Date(),
        lastContentItemId: g1ContentItems[g1ContentItems.length - 1]!.id,
      },
      create: {
        userId: student.id,
        groupId: g1.id,
        isGroupCompleted: true,
        completedAt: new Date(),
        lastContentItemId: g1ContentItems[g1ContentItems.length - 1]!.id,
      },
    });

    const questionItems = g1ContentItems.filter((ci) => ci.type === "QUESTION");
    for (const item of questionItems) {
      const subQ = item.subQuestions as Array<Record<string, unknown>> | null;
      if (!subQ) continue;

      for (let si = 0; si < subQ.length; si++) {
        const sub = subQ[si]!;
        const format = sub.format as string;
        const skill = sub.skill as string;
        let answer: string;
        let isCorrect = true;
        let scorePercent: number | null = null;

        if (format === "MULTIPLE_CHOICE" || format === "YES_NO") {
          answer = (sub.correctAnswer as string) ?? "";
        } else if (format === "SPEECH_RECOGNITION") {
          answer = (sub.expectedSpeech as string) ?? "";
          scorePercent = 95;
        } else if (format === "ESSAY") {
          if (
            skill === "WRITING" &&
            (sub.questionText as string).toLowerCase().includes("self-introduction")
          ) {
            answer =
              "My name is Budi. I am from Jakarta, Indonesia. I am a student at SMA Negeri 1. My hobby is playing football.";
          } else if (
            skill === "WRITING" &&
            (sub.questionText as string).toLowerCase().includes("color")
          ) {
            answer =
              "My favorite color is blue because it reminds me of the sky and the ocean. I can see blue everywhere - the sky above me, the sea when I go to the beach, and even my school uniform has blue in it. Blue makes me feel calm and peaceful.";
          } else {
            answer =
              "I wake up at 5 AM every day. First, I brush my teeth and take a shower. Then I eat breakfast with my family. After that, I go to school at 7 AM.";
          }
          scorePercent = 85;
        } else {
          answer = "Answered";
          isCorrect = false;
        }

        await prisma.userAnswer.create({
          data: {
            userId: student.id,
            contentItemId: item.id,
            subQuestionIndex: si,
            answer,
            isCorrect,
            scorePercent,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        });
        totalAnswers++;
      }
      totalPoints += 10;
    }
  }

  const g2ContentItems = await prisma.groupContentItem.findMany({
    where: { groupId: g2.id },
    orderBy: { order: "asc" },
  });

  const g2FirstQuestion = g2ContentItems.find((ci) => ci.type === "QUESTION");

  await prisma.userProgress.upsert({
    where: { userId_groupId: { userId: student.id, groupId: g2.id } },
    update: {
      isGroupCompleted: false,
      lastContentItemId: g2FirstQuestion?.id ?? g2ContentItems[0]?.id,
    },
    create: {
      userId: student.id,
      groupId: g2.id,
      isGroupCompleted: false,
      lastContentItemId: g2FirstQuestion?.id ?? g2ContentItems[0]?.id,
    },
  });

  if (g2FirstQuestion) {
    const subQ = g2FirstQuestion.subQuestions as Array<Record<string, unknown>> | null;
    if (subQ) {
      for (let si = 0; si < subQ.length; si++) {
        const sub = subQ[si]!;
        const format = sub.format as string;
        let answer: string;
        let isCorrect = true;
        let scorePercent: number | null = null;

        if (format === "MULTIPLE_CHOICE" || format === "YES_NO") {
          answer = (sub.correctAnswer as string) ?? "";
        } else if (format === "SPEECH_RECOGNITION") {
          answer = (sub.expectedSpeech as string) ?? "";
          scorePercent = 98;
        } else if (format === "ESSAY") {
          answer =
            "I like learning English because it is very useful. I study every day for one hour. My teacher is very helpful and kind.";
          scorePercent = 80;
        } else {
          answer = "Answered";
          isCorrect = false;
        }

        await prisma.userAnswer.create({
          data: {
            userId: student.id,
            contentItemId: g2FirstQuestion.id,
            subQuestionIndex: si,
            answer,
            isCorrect,
            scorePercent,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        });
        totalAnswers++;
      }
      totalPoints += 10;
    }
  }

  await prisma.user.update({
    where: { id: student.id },
    data: { points: totalPoints },
  });

  console.log(
    `  ✅ Student progress: ${totalAnswers} answers, ${totalPoints} points earned`
  );
}
