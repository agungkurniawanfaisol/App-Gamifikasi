import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { canAccessGroup } from "@/lib/progression";
import { GroupLearningFlow } from "@/components/student/group-learning-flow";
import type { ContentItemPayload } from "@/lib/content-item";
import { getSubQuestionsFromItem, parseOptions } from "@/lib/content-item";
import { isItemFullyAnswered } from "@/lib/sub-questions";
import { getGroupAssessmentQuestions } from "@/lib/assessments";
import { getSkillProgressStats } from "@/lib/skill-progress-queries";
import { PageHeader } from "@/components/ui/page-header";
import { getLevelLabel } from "@/lib/labels";
import { ContentItemType } from "@prisma/client";

export default async function LearnGroupPage({
  params,
}: {
  params: { levelId: string; groupId: string };
}) {
  const session = await requireStudent();
  const userId = getUserId(session);
  const levelId = parseInt(params.levelId, 10);
  const groupId = parseInt(params.groupId, 10);

  const allowed = await canAccessGroup(userId, groupId, levelId);
  if (!allowed) redirect(`/dashboard/learn/${levelId}`);

  const group = await prisma.learningGroup.findFirst({
    where: { id: groupId, levelId, isPublished: true },
    include: {
      contentItems: { orderBy: { order: "asc" } },
      level: { select: { name: true } },
    },
  });
  if (!group) notFound();

  const [progress, answers, assessments, assessmentAnswers, groupChatHistory, skillProgress] =
    await Promise.all([
    prisma.userProgress.findUnique({
      where: { userId_groupId: { userId, groupId } },
    }),
    prisma.userAnswer.findMany({
      where: {
        userId,
        contentItem: { groupId },
      },
      select: { contentItemId: true, subQuestionIndex: true },
    }),
    getGroupAssessmentQuestions(groupId, levelId),
    prisma.userAssessmentAnswer.findMany({
      where: {
        userId,
        question: { groupId },
      },
      select: { questionId: true, value: true },
    }),
    prisma.chatHistory.findMany({
      where: { userId, groupId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getSkillProgressStats(userId),
  ]);

  const items: ContentItemPayload[] = group.contentItems.map((item) => ({
    id: item.id,
    groupId: item.groupId,
    type: item.type,
    order: item.order,
    title: item.title,
    content: item.content,
    questionText: item.questionText,
    skill: item.skill,
    format: item.format,
    options: parseOptions(item.options),
    correctAnswer: item.correctAnswer,
    expectedSpeech: item.expectedSpeech,
    audioUrl: item.audioUrl,
    explanation: item.explanation,
    essayRubric: item.essayRubric,
    subQuestions: getSubQuestionsFromItem(item),
  }));

  const answeredIds = items
    .filter((item) => {
      if (item.type === ContentItemType.MATERIAL) return false;
      const itemAnswers = answers.filter((a) => a.contentItemId === item.id);
      return isItemFullyAnswered(item.subQuestions?.length ?? 0, itemAnswers);
    })
    .map((item) => item.id);

  const questionItems = items.filter((item) => item.type === ContentItemType.QUESTION);
  const allQuestionsAnswered =
    questionItems.length === 0 ||
    questionItems.every((item) => answeredIds.includes(item.id));
  const lastItemId = items[items.length - 1]?.id;
  const reachedEnd =
    lastItemId != null && progress?.lastContentItemId === lastItemId;
  const contentComplete = allQuestionsAnswered && reachedEnd;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden md:min-h-[480px]">
      <PageHeader
        title={group.title}
        className="mb-2 hidden shrink-0 md:mb-4 md:block"
      />
      <div className="min-h-0 flex-1 overflow-hidden">
        <GroupLearningFlow
          levelId={levelId}
          groupId={groupId}
          groupTitle={group.title}
          levelName={getLevelLabel(group.level.name)}
          items={items}
          pretest={assessments.pretest}
          posttest={assessments.posttest}
          pretestAnswers={assessmentAnswers
            .filter((a) => assessments.pretest.some((q) => q.id === a.questionId))
            .map((a) => ({ questionId: a.questionId, value: a.value }))}
          posttestAnswers={assessmentAnswers
            .filter((a) => assessments.posttest.some((q) => q.id === a.questionId))
            .map((a) => ({ questionId: a.questionId, value: a.value }))}
          initialContentItemId={progress?.lastContentItemId ?? null}
          answeredIds={answeredIds}
          subAnswers={answers.map((a) => ({
            contentItemId: a.contentItemId,
            subQuestionIndex: a.subQuestionIndex,
          }))}
          contentComplete={contentComplete}
          groupCompleted={
            (progress?.isGroupCompleted ?? false) &&
            progress?.testimonialSubmittedAt != null
          }
          completionScore={progress?.groupScorePercent}
          completionAiFeedback={progress?.aiCompletionFeedback}
          testimonialSubmitted={progress?.testimonialSubmittedAt != null}
          testimonialRating={progress?.testimonialRating}
          testimonialText={progress?.testimonialText}
          groupChatMessages={[...groupChatHistory].reverse().map((h) => ({
            id: h.id,
            role: h.role,
            message: h.message,
          }))}
          skillProgress={skillProgress}
        />
      </div>
    </div>
  );
}
