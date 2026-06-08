import { Check, Circle } from "lucide-react";
import type { LearningPhase } from "@/lib/learning-phase";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

type StepDef = {
  id: LearningPhase | "finishedMarker";
  label: string;
  theme: {
    active: string;
    done: string;
    pending: string;
    connector: string;
  };
};

const STEPS: StepDef[] = [
  {
    id: "pretest",
    label: labels.admin.userProgress.phasePretest,
    theme: {
      active: "border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/30",
      done: "border-sky-500 bg-sky-500 text-white",
      pending: "border-muted-foreground/30 bg-muted text-muted-foreground",
      connector: "bg-sky-500/40",
    },
  },
  {
    id: "content",
    label: labels.admin.userProgress.phaseContent,
    theme: {
      active: "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30",
      done: "border-emerald-500 bg-emerald-500 text-white",
      pending: "border-muted-foreground/30 bg-muted text-muted-foreground",
      connector: "bg-emerald-500/40",
    },
  },
  {
    id: "posttest",
    label: labels.admin.userProgress.phasePosttest,
    theme: {
      active: "border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/30",
      done: "border-violet-500 bg-violet-500 text-white",
      pending: "border-muted-foreground/30 bg-muted text-muted-foreground",
      connector: "bg-violet-500/40",
    },
  },
  {
    id: "finishedMarker",
    label: labels.admin.userProgress.phaseFinished,
    theme: {
      active: "border-success bg-success/15 text-success ring-2 ring-success/30",
      done: "border-success bg-success text-success-foreground",
      pending: "border-muted-foreground/30 bg-muted text-muted-foreground",
      connector: "bg-success/40",
    },
  },
];

const PHASE_ORDER: LearningPhase[] = ["pretest", "content", "posttest", "finished"];

function stepIndex(phase: LearningPhase): number {
  return PHASE_ORDER.indexOf(phase);
}

export function GroupPhaseStepper({
  phase,
  contentPercent,
}: {
  phase: LearningPhase;
  contentPercent: number;
}) {
  const currentIndex = stepIndex(phase);

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
      {STEPS.map((step, index) => {
        const isFinishedStep = step.id === "finishedMarker";
        const stepPhaseIndex = isFinishedStep ? 3 : stepIndex(step.id as LearningPhase);
        const isDone = currentIndex > stepPhaseIndex;
        const isActive = currentIndex === stepPhaseIndex;
        const isPending = currentIndex < stepPhaseIndex;

        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <div className="flex min-w-0 flex-col items-center gap-1">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold sm:size-8 sm:text-xs",
                  isDone && step.theme.done,
                  isActive && step.theme.active,
                  isPending && step.theme.pending
                )}
              >
                {isDone ? (
                  <Check className="size-3.5" />
                ) : isActive ? (
                  <span className="size-2 rounded-full bg-current animate-pulse" />
                ) : (
                  <Circle className="size-3 opacity-40" />
                )}
              </div>
              <span
                className={cn(
                  "max-w-[4.5rem] truncate text-center text-[10px] font-medium sm:max-w-none sm:text-xs",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
                {step.id === "content" && isActive && contentPercent > 0
                  ? ` ${contentPercent}%`
                  : ""}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "hidden h-0.5 w-4 sm:block sm:w-6",
                  isDone ? step.theme.connector : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
