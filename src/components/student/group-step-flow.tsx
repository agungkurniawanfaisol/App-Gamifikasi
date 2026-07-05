"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ContentItemType,
  QuestionFormat,
  QuestionSkill,
} from "@prisma/client";
import {
  updateLastContentItem,
  markGroupCompleted,
  completeMaterial,
} from "@/actions/student/progress";
import type { ContentItemPayload } from "@/lib/content-item";
import {
  getContentItemLabel,
  getFormatLabel,
  getSkillLabel,
  tiptapJsonToHtml,
} from "@/lib/content-item";
import { QuestionStepRenderer } from "@/components/student/steps/question-step-renderer";
import { MaterialAttachmentViewer } from "@/components/admin/content-builder/material-attachment-viewer";
import type { SubQuestion } from "@/lib/sub-questions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { labels } from "@/lib/labels";
import { notifyProgressRewards } from "@/lib/proficiency-toast";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Trophy,
  Sparkles,
  GraduationCap,
  FileText,
  ArrowLeft,
} from "lucide-react";

export type SubAnswerRecord = {
  contentItemId: number;
  subQuestionIndex: number;
};

export function GroupStepFlow({
  levelId,
  groupId,
  items,
  currentIndex,
  onCurrentIndexChange,
  answeredIds,
  subAnswers = [],
  onItemAnswered,
  onContentComplete,
  finishLabel,
}: {
  levelId: number;
  groupId: number;
  items: ContentItemPayload[];
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
  answeredIds: number[];
  subAnswers?: SubAnswerRecord[];
  onItemAnswered?: (itemId: number) => void;
  onContentComplete?: () => void | Promise<void>;
  finishLabel?: string;
}) {
  const router = useRouter();
  const [stepAnswered, setStepAnswered] = useState(
    () => new Set(answeredIds)
  );
  const [finished, setFinished] = useState(false);
  const [pointsAdded, setPointsAdded] = useState(0);

  const current = items[currentIndex];
  const isLast = currentIndex === items.length - 1;
  const [canAdvanceSub, setCanAdvanceSub] = useState(false);
  const [canRetreatSub, setCanRetreatSub] = useState(false);
  const [itemFullyAnswered, setItemFullyAnswered] = useState(false);
  const [continueHint, setContinueHint] = useState<string | null>(null);
  const advanceSubRef = useRef<() => void>(() => {});
  const retreatSubRef = useRef<() => void>(() => {});

  const answeredIdsKey = useMemo(
    () => [...answeredIds].sort((a, b) => a - b).join(","),
    [answeredIds]
  );

  useEffect(() => {
    setStepAnswered((prev) => {
      const merged = new Set(prev);
      for (const id of answeredIds) merged.add(id);
      return merged;
    });
  }, [answeredIdsKey, answeredIds]);

  const handleSubNavChange = useCallback((state: SubNavState) => {
    setCanAdvanceSub(state.canAdvanceSub);
    setCanRetreatSub(state.canRetreatSub);
    setItemFullyAnswered(state.itemFullyAnswered);
    setContinueHint(state.continueHint);
    advanceSubRef.current = state.advanceSub;
    retreatSubRef.current = state.retreatSub;
  }, []);

  const canContinue =
    current?.type === ContentItemType.MATERIAL ||
    stepAnswered.has(current?.id ?? 0) ||
    itemFullyAnswered ||
    canAdvanceSub;

  const progressPercent = Math.round(
    ((stepAnswered.size + currentIndex) / items.length) * 100
  );
  const stepTypeIcon =
    current?.type === ContentItemType.MATERIAL ? (
      <FileText className="size-4" />
    ) : (
      <HelpCircle className="size-4" />
    );

  useEffect(() => {
    setCanAdvanceSub(false);
    setCanRetreatSub(false);
    setItemFullyAnswered(false);
    setContinueHint(null);
  }, [current?.id]);

  async function goTo(index: number) {
    const item = items[index];
    if (!item) return;
    onCurrentIndexChange(index);
    await updateLastContentItem(groupId, item.id, levelId);
    router.refresh();
  }

  async function awardMaterialIfNeeded(item: ContentItemPayload) {
    if (item.type !== ContentItemType.MATERIAL) return;
    const result = await completeMaterial(item.id, groupId, levelId);
    notifyProgressRewards(
      result,
      () => router.refresh()
    );
  }

  function handlePrevious() {
    if (canRetreatSub) {
      retreatSubRef.current();
      return;
    }
    if (currentIndex === 0) return;
    void goTo(currentIndex - 1);
  }

  async function handleNext() {
    if (!current) return;

    if (
      current.type === ContentItemType.QUESTION &&
      !stepAnswered.has(current.id) &&
      !itemFullyAnswered &&
      canAdvanceSub
    ) {
      advanceSubRef.current();
      return;
    }

    if (!canContinue) return;

    if (current.type === ContentItemType.MATERIAL) {
      await awardMaterialIfNeeded(current);
    }

    if (isLast) {
      if (onContentComplete) {
        await onContentComplete();
        await updateLastContentItem(groupId, current.id, levelId);
        return;
      }
      await updateLastContentItem(groupId, current.id, levelId);
      const result = await markGroupCompleted(groupId, levelId);
      setPointsAdded(result.pointsAdded);
      notifyProgressRewards(
        result,
        () => router.refresh()
      );
      setFinished(true);
      return;
    }
    await goTo(currentIndex + 1);
  }

  if (items.length === 0) {
    return (
      <div className="surface-card px-6 py-10 text-center text-muted-foreground">
        {labels.student.noMaterials}
      </div>
    );
  }

  if (finished) {
    return (
      <div className="animate-scale-in surface-card-featured relative overflow-hidden p-10 text-center">
        {/* Decorative sparkle background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-amber-500/5 blur-3xl" />
        </div>
        <div className="relative">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success/15">
            <Trophy className="size-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold">{labels.student.quizComplete}</h2>
          {pointsAdded > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-5 py-2">
              <Sparkles className="size-4 text-amber-500" />
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {labels.student.pointsAdded(pointsAdded)}
              </span>
            </div>
          )}
          <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
            <Button
              variant="default"
              className="gap-2"
              onClick={() => router.push(`/dashboard/learn/${levelId}`)}
            >
              <ArrowLeft className="size-4" />
              {labels.student.backToLevel}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push(`/dashboard/learn/${levelId}/${groupId}`)}
            >
              <GraduationCap className="size-4" />
              {labels.student.reviewAgain}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const stepTypeBadgeClass =
    current?.type === ContentItemType.MATERIAL
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : "bg-amber-500/15 text-amber-700 dark:text-amber-300";

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden sm:gap-5">
        {/* Top progress bar */}
        <div className="surface-card shrink-0 overflow-hidden rounded-xl">
          <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {stepTypeIcon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">
                  {getContentItemLabel(current)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {labels.admin.stepOf(currentIndex + 1, items.length)}
                </p>
              </div>
            </div>
            <div className="ml-auto hidden items-center gap-3 sm:flex">
              <span className="text-sm font-semibold text-primary">{progressPercent}%</span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <Badge className={cn("hidden sm:inline-flex", stepTypeBadgeClass)}>
              {current.type === ContentItemType.MATERIAL
                ? labels.student.stepTypeMaterial
                : labels.student.stepTypeQuestion}
            </Badge>
          </div>
        </div>

        {/* Scrollable content area */}
        <div
          key={current.id}
          className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-card shadow-sm transition-all duration-300 animate-slide-up"
        >
          {current.type === ContentItemType.MATERIAL ? (
            <div className="p-5 sm:p-8">
              {current.title && (
                <h2 className="mb-5 text-xl font-bold tracking-tight sm:text-2xl">
                  {current.title}
                </h2>
              )}
              {current.content && (
                <div
                  className="prose-content"
                  dangerouslySetInnerHTML={{
                    __html: tiptapJsonToHtml(current.content),
                  }}
                />
              )}
              {current.attachments && current.attachments.length > 0 && (
                <div className={current.content ? "mt-6 space-y-4" : "space-y-4"}>
                  {current.attachments.map((attachment) => (
                    <MaterialAttachmentViewer
                      key={attachment.id}
                      attachment={attachment}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 sm:p-8">
              <CompositeQuestionStep
                key={current.id}
                item={current}
                initialAnsweredSubs={subAnswers
                  .filter((a) => a.contentItemId === current.id)
                  .map((a) => a.subQuestionIndex)}
                onComplete={() => {
                  setStepAnswered((prev) => new Set(prev).add(current.id));
                  onItemAnswered?.(current.id);
                }}
                onSubNavChange={handleSubNavChange}
              />
            </div>
          )}
        </div>

        {/* Hint text when can't continue */}
        {!canContinue && (
          <div className="shrink-0 animate-slide-up rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
            {current.type === ContentItemType.MATERIAL
              ? labels.student.readToContinue
              : continueHint ?? labels.student.answerSubToContinue}
          </div>
        )}
        {canAdvanceSub && !stepAnswered.has(current.id) && !itemFullyAnswered && (
          <div className="shrink-0 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm text-primary">
            {labels.student.advanceToNextPart}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-4">
          <Button
            variant="outline"
            disabled={currentIndex === 0 && !canRetreatSub}
            onClick={handlePrevious}
            className="w-full gap-2 sm:w-auto"
          >
            <ChevronLeft className="size-4" />
            {labels.student.previous}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canContinue}
            className={cn(
              "w-full gap-2 sm:w-auto",
              canContinue && isLast && "bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90"
            )}
          >
            {isLast ? (
              <>
                <Trophy className="size-4" />
                {finishLabel ?? labels.student.finishGroup}
              </>
            ) : (
              <>
                {labels.student.next}
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </div>
    </div>
  );
}

type SubNavState = {
  canAdvanceSub: boolean;
  canRetreatSub: boolean;
  itemFullyAnswered: boolean;
  advanceSub: () => void;
  retreatSub: () => void;
  continueHint: string | null;
};

function getSubContinueHint(sub: SubQuestion | undefined): string {
  if (!sub) return labels.student.answerSubToContinue;

  switch (sub.format) {
    case QuestionFormat.ESSAY:
      return labels.student.submitEssayToContinue;
    case QuestionFormat.SPEECH_RECOGNITION:
      return labels.student.completeSpeechToContinue;
    default:
      if (sub.skill === QuestionSkill.SPEAKING) {
        return labels.student.completeSpeechToContinue;
      }
      return labels.student.answerSubToContinue;
  }
}

function CompositeQuestionStep({
  item,
  initialAnsweredSubs = [],
  onComplete,
  onSubNavChange,
}: {
  item: ContentItemPayload;
  initialAnsweredSubs?: number[];
  onComplete: () => void;
  onSubNavChange?: (state: SubNavState) => void;
}) {
  const subQuestions = item.subQuestions ?? [];
  const firstUnanswered = subQuestions.findIndex(
    (_, i) => !initialAnsweredSubs.includes(i)
  );
  const [subIndex, setSubIndex] = useState(
    firstUnanswered >= 0 ? firstUnanswered : 0
  );
  const [answeredSubs, setAnsweredSubs] = useState<Set<number>>(
    () => new Set(initialAnsweredSubs)
  );

  const currentSub = subQuestions[subIndex];

  const advanceSub = useCallback(() => {
    setSubIndex((index) => {
      if (index >= subQuestions.length - 1) return index;
      return index + 1;
    });
  }, [subQuestions.length]);

  const retreatSub = useCallback(() => {
    setSubIndex((index) => {
      if (index <= 0) return index;
      return index - 1;
    });
  }, []);

  const publishSubNavState = useCallback(
    (answered: Set<number>, index: number) => {
      const allAnswered =
        subQuestions.length > 0 && answered.size === subQuestions.length;
      const canAdvance =
        answered.has(index) && index < subQuestions.length - 1;
      onSubNavChange?.({
        canAdvanceSub: canAdvance,
        canRetreatSub: index > 0,
        itemFullyAnswered: allAnswered,
        advanceSub,
        retreatSub,
        continueHint: canAdvance
          ? labels.student.advanceToNextPart
          : allAnswered
            ? null
            : getSubContinueHint(subQuestions[index]),
      });
    },
    [advanceSub, retreatSub, onSubNavChange, subQuestions]
  );

  useEffect(() => {
    publishSubNavState(answeredSubs, subIndex);
  }, [answeredSubs, subIndex, publishSubNavState]);

  useEffect(() => {
    setAnsweredSubs(new Set(initialAnsweredSubs));
    const firstOpen = subQuestions.findIndex(
      (_, index) => !initialAnsweredSubs.includes(index)
    );
    setSubIndex(firstOpen >= 0 ? firstOpen : 0);
    // Sync server answers when switching question items only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  useEffect(() => {
    if (subQuestions.length === 0) {
      onComplete();
      return;
    }
    if (
      subQuestions.length > 0 &&
      initialAnsweredSubs.length === subQuestions.length
    ) {
      onComplete();
    }
    // Only sync completion when loading pre-answered subs from the server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  if (subQuestions.length === 0) {
    return null;
  }

  if (!currentSub) {
    return (
      <p className="text-muted-foreground">{labels.student.noQuestions}</p>
    );
  }

  function handleSubAnswered() {
    const next = new Set(answeredSubs).add(subIndex);
    setAnsweredSubs(next);
    if (next.size === subQuestions.length) {
      onComplete();
    }
    publishSubNavState(next, subIndex);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-question navigation dots */}
      {subQuestions.length > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {subQuestions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (answeredSubs.has(i) || i === subIndex || i < subIndex) {
                    setSubIndex(i);
                  }
                }}
                className={cn(
                  "flex size-11 min-h-11 min-w-11 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200",
                  i === subIndex && "bg-primary text-primary-foreground shadow-sm shadow-primary/30 ring-2 ring-primary/30",
                  answeredSubs.has(i) && i !== subIndex && "bg-success/15 text-success",
                  !answeredSubs.has(i) && i !== subIndex && "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {answeredSubs.has(i) ? (
                  <Check className="size-3" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {getSkillLabel(currentSub.skill)}
            </Badge>
            <Badge className="text-[10px]">
              {getFormatLabel(currentSub.format)}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {currentSub.weightPercent}%
            </Badge>
          </div>
        </div>
      )}

      {subQuestions.length > 1 && (
        <p className="text-xs font-medium text-muted-foreground">
          {labels.student.subQuestionPart(subIndex + 1, subQuestions.length)}
        </p>
      )}

      {subQuestions.length === 1 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {getSkillLabel(currentSub.skill)}
          </Badge>
          <Badge className="text-[10px]">
            {getFormatLabel(currentSub.format)}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {currentSub.weightPercent}%
          </Badge>
        </div>
      )}

      <SubQuestionRenderer
        key={subIndex}
        itemId={item.id}
        sub={currentSub}
        subQuestionIndex={subIndex}
        initiallyAnswered={initialAnsweredSubs.includes(subIndex)}
        onAnswered={handleSubAnswered}
      />
    </div>
  );
}

function SubQuestionRenderer({
  itemId,
  sub,
  subQuestionIndex,
  initiallyAnswered = false,
  onAnswered,
}: {
  itemId: number;
  sub: SubQuestion;
  subQuestionIndex: number;
  initiallyAnswered?: boolean;
  onAnswered: () => void;
}) {
  return (
    <QuestionStepRenderer
      question={{
        contentItemId: itemId,
        subQuestionIndex,
        questionText: sub.questionText,
        skill: sub.skill,
        format: sub.format,
        options: sub.options,
        expectedSpeech: sub.expectedSpeech,
        correctAnswer: sub.correctAnswer,
        audioUrl: sub.audioUrl,
        essayRubric: sub.essayRubric,
      }}
      initiallyAnswered={initiallyAnswered}
      onAnswered={onAnswered}
    />
  );
}
