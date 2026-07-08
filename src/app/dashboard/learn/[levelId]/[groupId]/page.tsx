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
import { userChatTodayWhere } from "@/lib/chat-day";
import { mapChatHistoryRows } from "@/lib/chat-message-meta";
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
    select: {
      id: true,
      title: true,
      level: { select: { name: true } },
      contentItems: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          groupId: true,
          type: true,
          order: true,
          title: true,
          content: true,
          questionText: true,
          skill: true,
          format: true,
          options: true,
          correctAnswer: true,
          expectedSpeech: true,
          audioUrl: true,
          explanation: true,
          essayRubric: true,
          subQuestions: true,
        },
      },
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
      where: userChatTodayWhere(userId, groupId),
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

  const answersByItem = new Map<
    number,
    Array<{ contentItemId: number; subQuestionIndex: number }>
  >();
  for (const answer of answers) {
    const bucket = answersByItem.get(answer.contentItemId) ?? [];
    bucket.push(answer);
    answersByItem.set(answer.contentItemId, bucket);
  }

  const answeredIds = items
    .filter((item) => {
      if (item.type === ContentItemType.MATERIAL) return false;
      return isItemFullyAnswered(
        item.subQuestions?.length ?? 0,
        answersByItem.get(item.id) ?? []
      );
    })
    .map((item) => item.id);
  const answeredIdSet = new Set(answeredIds);

  const questionItems = items.filter((item) => item.type === ContentItemType.QUESTION);
  const allQuestionsAnswered =
    questionItems.length === 0 ||
    questionItems.every((item) => answeredIdSet.has(item.id));
  const lastItemId = items[items.length - 1]?.id;
  const reachedEnd =
    lastItemId != null && progress?.lastContentItemId === lastItemId;
  const contentComplete = allQuestionsAnswered && reachedEnd;

  const pretestIdSet = new Set(assessments.pretest.map((q) => q.id));
  const posttestIdSet = new Set(assessments.posttest.map((q) => q.id));
  const pretestAnswerRows: Array<{ questionId: number; value: number }> = [];
  const posttestAnswerRows: Array<{ questionId: number; value: number }> = [];
  for (const answer of assessmentAnswers) {
    if (pretestIdSet.has(answer.questionId)) {
      pretestAnswerRows.push({ questionId: answer.questionId, value: answer.value });
      continue;
    }
    if (posttestIdSet.has(answer.questionId)) {
      posttestAnswerRows.push({ questionId: answer.questionId, value: answer.value });
    }
  }

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
          pretestAnswers={pretestAnswerRows}
          posttestAnswers={posttestAnswerRows}
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
          groupChatMessages={mapChatHistoryRows([...groupChatHistory].reverse())}
          skillProgress={skillProgress}
        />
      </div>
    </div>
  );
}
