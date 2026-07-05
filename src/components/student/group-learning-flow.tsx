"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentPhase, ContentItemType } from "@prisma/client";
import { GroupStepFlow } from "@/components/student/group-step-flow";
import { AssessmentStep } from "@/components/student/assessment-step";
import { LearnAiScopeSync } from "@/components/student/learn-ai-scope-sync";
import { LearningLayout } from "@/components/student/learning-layout";
import { LearningSidebar } from "@/components/student/learning-sidebar";
import type { SkillProgressStat } from "@/lib/skill-progress";
import type { ContentItemPayload } from "@/lib/content-item";
import { getContentItemLabel, getStepContextForAi } from "@/lib/content-item";
import type {
  AssessmentAnswerRecord,
  AssessmentQuestionPayload,
} from "@/lib/assessments";
import { resolveInitialPhase, type LearningPhase } from "@/lib/learning-phase";
import { GroupCompletionPanel } from "@/components/student/group-completion-panel";
import { prepareGroupCompletion } from "@/actions/student/group-completion";
import { updateLastContentItem } from "@/actions/student/progress";
import type { SubAnswerRecord } from "@/components/student/group-step-flow";
import type { LearnChatApiContext } from "@/components/student/chat-interface";
import { labels } from "@/lib/labels";
import { toast } from "sonner";

type GroupChatMessage = {
  id: number;
  role: "USER" | "ASSISTANT";
  message: string;
};

export function GroupLearningFlow({
  levelId,
  groupId,
  groupTitle,
  levelName,
  items,
  pretest,
  posttest,
  pretestAnswers,
  posttestAnswers,
  initialContentItemId,
  answeredIds,
  subAnswers,
  contentComplete,
  groupCompleted,
  groupChatMessages,
  skillProgress,
  completionScore,
  completionAiFeedback,
  testimonialSubmitted,
  testimonialRating,
  testimonialText,
}: {
  levelId: number;
  groupId: number;
  groupTitle: string;
  levelName: string;
  items: ContentItemPayload[];
  pretest: AssessmentQuestionPayload[];
  posttest: AssessmentQuestionPayload[];
  pretestAnswers: AssessmentAnswerRecord[];
  posttestAnswers: AssessmentAnswerRecord[];
  initialContentItemId: number | null;
  answeredIds: number[];
  subAnswers: SubAnswerRecord[];
  contentComplete: boolean;
  groupCompleted: boolean;
  groupChatMessages: GroupChatMessage[];
  skillProgress: SkillProgressStat[];
  completionScore?: number | null;
  completionAiFeedback?: string | null;
  testimonialSubmitted: boolean;
  testimonialRating?: number | null;
  testimonialText?: string | null;
}) {
  const router = useRouter();
  const initialContentIndex = initialContentItemId
    ? Math.max(0, items.findIndex((i) => i.id === initialContentItemId))
    : 0;

  const [phase, setPhase] = useState<LearningPhase>(() =>
    resolveInitialPhase(
      pretest,
      posttest,
      pretestAnswers,
      posttestAnswers,
      contentComplete,
      groupCompleted
    )
  );
  const [contentCompleteLocal, setContentCompleteLocal] = useState(contentComplete);
  const [contentCurrentIndex, setContentCurrentIndex] = useState(initialContentIndex);
  const [contentAnswered, setContentAnswered] = useState(() => new Set(answeredIds));
  const [assessmentCurrentIndex, setAssessmentCurrentIndex] = useState(0);
  const [assessmentAnswered, setAssessmentAnswered] = useState(() => {
    const ids = new Set<number>();
    for (const a of [...pretestAnswers, ...posttestAnswers]) {
      ids.add(a.questionId);
    }
    return ids;
  });

  const pretestComplete =
    pretest.length === 0 || pretest.every((q) => assessmentAnswered.has(q.id));
  const posttestComplete =
    posttest.length === 0 || posttest.every((q) => assessmentAnswered.has(q.id));

  const contentCompleteIds = useMemo(() => {
    const ids = new Set<number>();
    items.forEach((item, i) => {
      if (item.type === ContentItemType.MATERIAL && i < contentCurrentIndex) {
        ids.add(item.id);
      }
      if (contentAnswered.has(item.id)) {
        ids.add(item.id);
      }
    });
    return ids;
  }, [items, contentCurrentIndex, contentAnswered]);

  const mobileMeta = useMemo(() => {
    if (phase === "pretest") {
      const q = pretest[assessmentCurrentIndex];
      return {
        title: labels.student.pretestTitle,
        subtitle: q?.questionText ?? labels.student.stepTypePretest,
      };
    }
    if (phase === "posttest") {
      const q = posttest[assessmentCurrentIndex];
      return {
        title: labels.student.posttestTitle,
        subtitle: q?.questionText ?? labels.student.stepTypePosttest,
      };
    }
    const item = items[contentCurrentIndex];
    return {
      title: item ? getContentItemLabel(item) : labels.student.materialsPhase,
      subtitle: item
        ? item.type === ContentItemType.MATERIAL
          ? labels.student.stepTypeMaterial
          : labels.student.stepTypeQuestion
        : labels.admin.stepOf(contentCurrentIndex + 1, items.length),
    };
  }, [phase, pretest, posttest, assessmentCurrentIndex, items, contentCurrentIndex]);

  const chatContext = useMemo((): LearnChatApiContext => {
    if (phase === "finished") {
      return {
        phase: "posttest",
        stepLabel: labels.student.quizComplete,
        groupTitle,
        levelName,
      };
    }

    const contentItem =
      phase === "content" ? (items[contentCurrentIndex] ?? null) : null;
    const assessmentQuestion =
      phase === "pretest"
        ? pretest[assessmentCurrentIndex]
        : phase === "posttest"
          ? posttest[assessmentCurrentIndex]
          : null;

    const stepContext = getStepContextForAi(contentItem, phase, {
      assessmentQuestionText: assessmentQuestion?.questionText,
    });

    return {
      phase,
      stepLabel: stepContext.stepLabel,
      stepContent: stepContext.stepContent,
      groupTitle,
      levelName,
    };
  }, [
    phase,
    items,
    contentCurrentIndex,
    pretest,
    posttest,
    assessmentCurrentIndex,
    groupTitle,
    levelName,
  ]);

  async function finishGroup() {
    try {
      await prepareGroupCompletion(groupId, levelId);
      setPhase("finished");
      router.refresh();
    } catch {
      toast.error(labels.student.finishGroupFailed);
    }
  }

  async function goToContent(index: number) {
    const item = items[index];
    if (!item || !pretestComplete) return;
    setPhase("content");
    setContentCurrentIndex(index);
    try {
      await updateLastContentItem(groupId, item.id, levelId);
      router.refresh();
    } catch {
      toast.error(labels.student.progressUpdateFailed);
    }
  }

  function goToAssessment(index: number) {
    setAssessmentCurrentIndex(index);
  }

  const sidebar = (
    <LearningSidebar
      phase={phase}
      pretest={pretest}
      posttest={posttest}
      pretestComplete={pretestComplete}
      posttestComplete={posttestComplete}
      contentComplete={contentCompleteLocal}
      items={items}
      contentCurrentIndex={contentCurrentIndex}
      contentAnsweredIds={contentCompleteIds}
      assessmentCurrentIndex={assessmentCurrentIndex}
      assessmentAnsweredIds={assessmentAnswered}
      skillProgress={skillProgress}
      onSelectContent={phase === "content" ? goToContent : undefined}
      onSelectAssessment={
        phase === "pretest" || phase === "posttest" ? goToAssessment : undefined
      }
    />
  );

  const layoutProps = {
    sidebar,
    mobileTitle: mobileMeta.title,
    mobileSubtitle: mobileMeta.subtitle,
  };

  const scopeSync = (
    <LearnAiScopeSync
      groupId={groupId}
      groupTitle={groupTitle}
      chatContext={chatContext}
      messages={groupChatMessages}
    />
  );

  if (phase === "finished") {
    return (
      <>
        {scopeSync}
        <LearningLayout {...layoutProps}>
        <GroupCompletionPanel
          levelId={levelId}
          groupId={groupId}
          groupTitle={groupTitle}
          initialScore={completionScore}
          initialAiFeedback={completionAiFeedback}
          testimonialSubmitted={testimonialSubmitted}
          initialRating={testimonialRating}
          initialTestimonialText={testimonialText}
        />
        </LearningLayout>
      </>
    );
  }

  let mainContent = null;

  if (phase === "pretest" && pretest.length > 0) {
    mainContent = (
      <AssessmentStep
        phase={AssessmentPhase.PRETEST}
        levelId={levelId}
        groupId={groupId}
        questions={pretest}
        initialAnswers={pretestAnswers}
        currentIndex={assessmentCurrentIndex}
        onCurrentIndexChange={setAssessmentCurrentIndex}
        onAnswered={(questionId) => {
          setAssessmentAnswered((prev) => new Set(prev).add(questionId));
        }}
        onComplete={() => {
          setAssessmentCurrentIndex(0);
          setPhase("content");
        }}
      />
    );
  } else if (phase === "content") {
    const hasPosttest = posttest.length > 0;
    mainContent = (
      <GroupStepFlow
        levelId={levelId}
        groupId={groupId}
        items={items}
        currentIndex={contentCurrentIndex}
        onCurrentIndexChange={setContentCurrentIndex}
        answeredIds={answeredIds}
        subAnswers={subAnswers}
        onItemAnswered={(itemId) => {
          setContentAnswered((prev) => new Set(prev).add(itemId));
        }}
        onContentComplete={
          hasPosttest
            ? async () => {
                setContentCompleteLocal(true);
                setAssessmentCurrentIndex(0);
                setPhase("posttest");
              }
            : () => finishGroup()
        }
        finishLabel={
          hasPosttest ? labels.student.continueToPosttest : labels.student.finishGroup
        }
      />
    );
  } else if (phase === "posttest" && posttest.length > 0) {
    mainContent = (
      <AssessmentStep
        phase={AssessmentPhase.POSTTEST}
        levelId={levelId}
        groupId={groupId}
        questions={posttest}
        initialAnswers={posttestAnswers}
        currentIndex={assessmentCurrentIndex}
        onCurrentIndexChange={setAssessmentCurrentIndex}
        onAnswered={(questionId) => {
          setAssessmentAnswered((prev) => new Set(prev).add(questionId));
        }}
        onComplete={() => finishGroup()}
      />
    );
  }

  return (
    <>
      {scopeSync}
      <LearningLayout {...layoutProps}>{mainContent}</LearningLayout>
    </>
  );
}
