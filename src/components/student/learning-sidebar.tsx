"use client";

import { useEffect, useRef } from "react";
import { ContentItemType } from "@prisma/client";
import {
  Check,
  ClipboardCheck,
  ClipboardList,
  FileText,
  HelpCircle,
  List,
  Lock,
  Sparkles,
} from "lucide-react";
import type { ContentItemPayload } from "@/lib/content-item";
import { getContentItemLabel } from "@/lib/content-item";
import type { AssessmentQuestionPayload } from "@/lib/assessments";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SkillProgressStat } from "@/lib/skill-progress";
import { LearningProgressSkillsCompact } from "@/components/student/progress/learning-progress-skills-compact";
import { BadgeProgressRing } from "@/components/student/badges/badge-progress-ring";
import {
  useLearningStepsCompact,
  useLearningStepsPanel,
} from "@/components/student/learning-steps-context";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

import type { LearningPhase } from "@/lib/learning-phase";
export type { LearningPhase } from "@/lib/learning-phase";

type StepKind = "pretest" | "material" | "question" | "posttest";

const STEP_THEME: Record<
  StepKind,
  {
    border: string;
    activeBg: string;
    iconWrap: string;
    badge: string;
    dot: string;
  }
> = {
  pretest: {
    border: "border-l-sky-500",
    activeBg: "bg-sky-500/10 ring-1 ring-sky-500/25",
    iconWrap: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  material: {
    border: "border-l-emerald-500",
    activeBg: "bg-emerald-500/10 ring-1 ring-emerald-500/25",
    iconWrap: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  question: {
    border: "border-l-amber-500",
    activeBg: "bg-amber-500/10 ring-1 ring-amber-500/25",
    iconWrap: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  posttest: {
    border: "border-l-violet-500",
    activeBg: "bg-violet-500/10 ring-1 ring-violet-500/25",
    iconWrap: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
};

function SectionHeader({
  title,
  count,
  complete,
}: {
  title: string;
  count: number;
  complete?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <div className="flex items-center gap-1.5">
        {complete && <Check className="size-3 text-success" />}
        <span className="text-[10px] font-medium text-muted-foreground">{count}</span>
      </div>
    </div>
  );
}

function SidebarStepButton({
  kind,
  label,
  sublabel,
  index,
  isActive,
  isComplete,
  isLocked,
  onClick,
  compact = false,
  buttonRef,
}: {
  kind: StepKind;
  label: string;
  sublabel: string;
  index?: number;
  isActive: boolean;
  isComplete: boolean;
  isLocked?: boolean;
  onClick?: () => void;
  compact?: boolean;
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  const theme = STEP_THEME[kind];
  const Icon =
    kind === "pretest"
      ? ClipboardList
      : kind === "posttest"
        ? ClipboardCheck
        : kind === "material"
          ? FileText
          : HelpCircle;

  const iconContent = isLocked ? (
    <Lock className="size-3.5" />
  ) : isComplete && !isActive ? (
    <Check className="size-3.5" />
  ) : index !== undefined ? (
    index
  ) : (
    <Icon className="size-3.5" />
  );

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={buttonRef}
            type="button"
            disabled={isLocked || !onClick}
            onClick={onClick}
            aria-label={label}
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200",
              isActive &&
                "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30",
              isComplete && !isActive && "bg-success/15 text-success",
              !isActive && !isComplete && !isLocked && theme.iconWrap,
              isLocked && "cursor-not-allowed bg-muted text-muted-foreground/50"
            )}
          >
            {iconContent}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-56">
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      disabled={isLocked || !onClick}
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-start gap-3 border-l-4 px-3 py-3 text-left transition-all duration-200",
        theme.border,
        isActive && theme.activeBg,
        !isActive && !isLocked && "hover:bg-muted/50",
        isLocked && "cursor-not-allowed opacity-45"
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
          isActive && "bg-primary text-primary-foreground shadow-sm",
          isComplete && !isActive && "bg-success/15 text-success",
          !isActive && !isComplete && theme.iconWrap
        )}
      >
        {iconContent}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className={cn(
            "line-clamp-2 text-sm font-medium leading-snug",
            isActive && "text-foreground",
            isComplete && !isActive && "text-success",
            !isActive && !isComplete && "text-foreground/80"
          )}
        >
          {label}
        </p>
        <Badge
          variant="secondary"
          className={cn("mt-1.5 h-5 px-1.5 text-[10px] font-semibold", theme.badge)}
        >
          {sublabel}
        </Badge>
      </div>

      {isActive && (
        <span className={cn("mt-2 size-2 shrink-0 rounded-full", theme.dot)} />
      )}
    </button>
  );
}

export function LearningSidebar({
  phase,
  pretest,
  posttest,
  pretestComplete,
  posttestComplete,
  contentComplete,
  items,
  contentCurrentIndex,
  contentAnsweredIds,
  assessmentCurrentIndex,
  assessmentAnsweredIds,
  skillProgress,
  onSelectContent,
  onSelectAssessment,
}: {
  phase: LearningPhase;
  pretest: AssessmentQuestionPayload[];
  posttest: AssessmentQuestionPayload[];
  pretestComplete: boolean;
  posttestComplete: boolean;
  contentComplete: boolean;
  items: ContentItemPayload[];
  contentCurrentIndex: number;
  contentAnsweredIds: Set<number>;
  assessmentCurrentIndex: number;
  assessmentAnsweredIds: Set<number>;
  skillProgress: SkillProgressStat[];
  onSelectContent?: (index: number) => void;
  onSelectAssessment?: (index: number) => void;
}) {
  const collapsed = useLearningStepsCompact();
  const { toggle: expandStepsPanel } = useLearningStepsPanel();
  const activeStepRef = useRef<HTMLButtonElement>(null);
  const stepsScrollRef = useRef<HTMLDivElement>(null);
  const totalSteps =
    pretest.length + items.length + posttest.length;
  const completedSteps =
    (pretestComplete ? pretest.length : assessmentAnsweredIds.size) +
    contentAnsweredIds.size +
    (posttestComplete ? posttest.length : 0);
  const progressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const materialCount = items.filter((i) => i.type === ContentItemType.MATERIAL).length;
  const questionCount = items.filter((i) => i.type === ContentItemType.QUESTION).length;
  const contentLocked = !pretestComplete && pretest.length > 0;

  const compactSteps: {
    key: string;
    kind: StepKind;
    label: string;
    sublabel: string;
    index?: number;
    isActive: boolean;
    isComplete: boolean;
    isLocked?: boolean;
    onClick?: () => void;
  }[] = [];

  if (pretest.length > 0) {
    if (phase === "pretest") {
      pretest.forEach((q, i) => {
        compactSteps.push({
          key: `pretest-${q.id}`,
          kind: "pretest",
          label: q.questionText,
          sublabel: labels.student.stepTypePretest,
          index: i + 1,
          isActive: i === assessmentCurrentIndex,
          isComplete: assessmentAnsweredIds.has(q.id),
          onClick: onSelectAssessment ? () => onSelectAssessment(i) : undefined,
        });
      });
    } else {
      compactSteps.push({
        key: "pretest-summary",
        kind: "pretest",
        label: labels.student.pretestSummary(pretest.length),
        sublabel: labels.student.stepTypePretest,
        isActive: false,
        isComplete: pretestComplete,
        isLocked: !pretestComplete,
      });
    }
  }

  items.forEach((item, i) => {
    const isMaterial = item.type === ContentItemType.MATERIAL;
    compactSteps.push({
      key: `content-${item.id}`,
      kind: isMaterial ? "material" : "question",
      label: getContentItemLabel(item),
      sublabel: isMaterial
        ? labels.student.stepTypeMaterial
        : labels.student.stepTypeQuestion,
      index: i + 1,
      isActive: phase === "content" && i === contentCurrentIndex,
      isComplete: contentAnsweredIds.has(item.id),
      isLocked: contentLocked,
      onClick:
        !contentLocked && onSelectContent ? () => onSelectContent(i) : undefined,
    });
  });

  if (posttest.length > 0) {
    if (phase === "posttest") {
      posttest.forEach((q, i) => {
        compactSteps.push({
          key: `posttest-${q.id}`,
          kind: "posttest",
          label: q.questionText,
          sublabel: labels.student.stepTypePosttest,
          index: i + 1,
          isActive: i === assessmentCurrentIndex,
          isComplete: assessmentAnsweredIds.has(q.id),
          onClick: onSelectAssessment ? () => onSelectAssessment(i) : undefined,
        });
      });
    } else {
      compactSteps.push({
        key: "posttest-summary",
        kind: "posttest",
        label: labels.student.posttestSummary(posttest.length),
        sublabel: labels.student.stepTypePosttest,
        isActive: false,
        isComplete: posttestComplete,
        isLocked: !contentComplete,
      });
    }
  }

  useEffect(() => {
    if (!collapsed || !activeStepRef.current || !stepsScrollRef.current) return;

    const container = stepsScrollRef.current;
    const active = activeStepRef.current;
    const activeRect = active.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const targetTop =
      container.scrollTop +
      (activeRect.top - containerRect.top) -
      (container.clientHeight - active.clientHeight) / 2;

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "auto",
    });
  }, [collapsed]);

  if (collapsed) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border p-2.5">
          <div className="flex flex-col items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={expandStepsPanel}
                  className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/15"
                  aria-label={labels.student.stepsExpand}
                >
                  <List className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{labels.student.stepsExpand}</TooltipContent>
            </Tooltip>

            <BadgeProgressRing percent={progressPercent} size={52} strokeWidth={5}>
              <span className="text-[11px] font-bold text-primary">{progressPercent}%</span>
            </BadgeProgressRing>

            <p className="text-center text-[9px] leading-tight text-muted-foreground">
              {labels.student.sidebarProgress(completedSteps, totalSteps)}
            </p>
          </div>
        </div>

        <div
          ref={stepsScrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 py-2"
        >
          <div className="flex flex-col items-center gap-1.5">
            {compactSteps.map((step) => (
              <SidebarStepButton
                key={step.key}
                kind={step.kind}
                label={step.label}
                sublabel={step.sublabel}
                index={step.index}
                isActive={step.isActive}
                isComplete={step.isComplete}
                isLocked={step.isLocked}
                onClick={step.onClick}
                compact
                buttonRef={step.isActive ? activeStepRef : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">{labels.student.learningPath}</p>
            <p className="text-[11px] text-muted-foreground">
              {labels.student.sidebarProgress(completedSteps, totalSteps)}
            </p>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs font-semibold text-primary">
          {progressPercent}%
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full overscroll-contain">
          <div className="flex flex-col gap-1 py-2">
            {pretest.length > 0 && (
            <div className="mb-1">
              <SectionHeader
                title={labels.student.pretestTitle}
                count={pretest.length}
                complete={pretestComplete}
              />
              {phase === "pretest" ? (
                <div className="flex flex-col gap-0.5">
                  {pretest.map((q, i) => (
                    <SidebarStepButton
                      key={q.id}
                      kind="pretest"
                      label={q.questionText}
                      sublabel={labels.student.stepTypePretest}
                      index={i + 1}
                      isActive={i === assessmentCurrentIndex}
                      isComplete={assessmentAnsweredIds.has(q.id)}
                      onClick={
                        onSelectAssessment ? () => onSelectAssessment(i) : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <SidebarStepButton
                  kind="pretest"
                  label={labels.student.pretestSummary(pretest.length)}
                  sublabel={labels.student.stepTypePretest}
                  isActive={false}
                  isComplete={pretestComplete}
                  isLocked={!pretestComplete}
                />
              )}
            </div>
          )}

          {items.length > 0 && (
            <div className="mb-1">
              <SectionHeader
                title={labels.student.materialsPhase}
                count={items.length}
                complete={contentComplete}
              />
              <div className="flex flex-col gap-0.5">
                {items.map((item, i) => {
                  const isMaterial = item.type === ContentItemType.MATERIAL;
                  const kind = isMaterial ? "material" : "question";

                  return (
                    <SidebarStepButton
                      key={item.id}
                      kind={kind}
                      label={getContentItemLabel(item)}
                      sublabel={
                        isMaterial
                          ? labels.student.stepTypeMaterial
                          : labels.student.stepTypeQuestion
                      }
                      index={i + 1}
                      isActive={phase === "content" && i === contentCurrentIndex}
                      isComplete={contentAnsweredIds.has(item.id)}
                      isLocked={contentLocked}
                      onClick={
                        !contentLocked && onSelectContent
                          ? () => onSelectContent(i)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}

          {posttest.length > 0 && (
            <div>
              <SectionHeader
                title={labels.student.posttestTitle}
                count={posttest.length}
                complete={posttestComplete}
              />
              {phase === "posttest" ? (
                <div className="flex flex-col gap-0.5">
                  {posttest.map((q, i) => (
                    <SidebarStepButton
                      key={q.id}
                      kind="posttest"
                      label={q.questionText}
                      sublabel={labels.student.stepTypePosttest}
                      index={i + 1}
                      isActive={i === assessmentCurrentIndex}
                      isComplete={assessmentAnsweredIds.has(q.id)}
                      onClick={
                        onSelectAssessment ? () => onSelectAssessment(i) : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <SidebarStepButton
                  kind="posttest"
                  label={labels.student.posttestSummary(posttest.length)}
                  sublabel={labels.student.stepTypePosttest}
                  isActive={false}
                  isComplete={posttestComplete}
                  isLocked={!contentComplete}
                />
              )}
            </div>
          )}

            <div className="mt-2 space-y-3 border-t border-border px-3 pb-3 pt-4">
              <LearningProgressSkillsCompact skills={skillProgress} />
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1.5 text-emerald-700 dark:text-emerald-300">
                  <FileText className="size-3 shrink-0" />
                  <span>{labels.student.materialCount(materialCount)}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-amber-700 dark:text-amber-300">
                  <HelpCircle className="size-3 shrink-0" />
                  <span>{labels.student.questionCount(questionCount)}</span>
                </div>
                {pretest.length > 0 && (
                  <div className="flex items-center gap-1.5 rounded-md bg-sky-500/10 px-2 py-1.5 text-sky-700 dark:text-sky-300">
                    <ClipboardList className="size-3 shrink-0" />
                    <span>{labels.student.pretestCount(pretest.length)}</span>
                  </div>
                )}
                {posttest.length > 0 && (
                  <div className="flex items-center gap-1.5 rounded-md bg-violet-500/10 px-2 py-1.5 text-violet-700 dark:text-violet-300">
                    <ClipboardCheck className="size-3 shrink-0" />
                    <span>{labels.student.posttestCount(posttest.length)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
