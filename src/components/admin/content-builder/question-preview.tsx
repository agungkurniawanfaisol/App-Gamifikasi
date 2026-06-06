"use client";

import {
  QuestionFormat,
  QuestionSkill,
} from "@prisma/client";
import {
  BookOpen,
  CheckCircle2,
  Headphones,
  ListChecks,
  MessageSquareText,
  Mic,
  PenLine,
  Pencil,
  ScrollText,
  Volume2,
  XCircle,
} from "lucide-react";
import type { ContentItemPayload } from "@/lib/content-item";
import {
  getFormatLabel,
  getSkillLabel,
} from "@/lib/content-item";
import type { SubQuestion } from "@/lib/sub-questions";
import { Badge } from "@/components/ui/badge";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

const OPTION_LABELS = ["A", "B", "C", "D"];

const skillIcons: Record<QuestionSkill, React.ComponentType<{ className?: string }>> = {
  [QuestionSkill.SPEAKING]: Mic,
  [QuestionSkill.READING]: BookOpen,
  [QuestionSkill.WRITING]: Pencil,
  [QuestionSkill.LISTENING]: Headphones,
};

const formatIcons: Record<QuestionFormat, React.ComponentType<{ className?: string }>> = {
  [QuestionFormat.MULTIPLE_CHOICE]: ListChecks,
  [QuestionFormat.YES_NO]: CheckCircle2,
  [QuestionFormat.ESSAY]: ScrollText,
  [QuestionFormat.SPEECH_RECOGNITION]: Volume2,
};

export function QuestionPreview({ item }: { item: ContentItemPayload }) {
  const subs = item.subQuestions ?? [];

  if (subs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <MessageSquareText className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          {labels.admin.materialPreviewEmpty}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Summary bar */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ListChecks className="size-3.5" />
        <span>
          {subs.length} sub-question{subs.length !== 1 ? "s" : ""}
        </span>
        <span className="text-border">·</span>
        <span>
          {new Set(subs.map((s) => s.skill)).size} skill(s)
        </span>
      </div>

      {subs.map((sub, index) => (
        <SubQuestionPreview key={sub.id} sub={sub} index={index} />
      ))}
    </div>
  );
}

function SubQuestionPreview({
  sub,
  index,
}: {
  sub: SubQuestion;
  index: number;
}) {
  const SkillIcon = skillIcons[sub.skill];
  const FormatIcon = formatIcons[sub.format];
  const options = sub.options ?? [];

  return (
    <div className="surface-card overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-4 py-2.5">
        <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-mono font-semibold text-muted-foreground">
          {index + 1}
        </span>
        <Badge variant="outline" className="gap-1.5">
          <SkillIcon className="size-3" />
          {getSkillLabel(sub.skill)}
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <FormatIcon className="size-3" />
          {getFormatLabel(sub.format)}
        </Badge>
        <Badge variant="outline" className="ml-auto">
          {sub.weightPercent}%
        </Badge>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Question text */}
        {sub.questionText && (
          <p className="mb-4 whitespace-pre-wrap text-sm font-medium leading-relaxed">
            {sub.questionText}
          </p>
        )}

        {/* Multiple Choice options */}
        {sub.format === QuestionFormat.MULTIPLE_CHOICE && options.some(Boolean) && (
          <div className="mb-3 grid gap-2">
            {options.map((opt, i) => {
              if (!opt) return null;
              const isCorrect = sub.correctAnswer === opt;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    isCorrect
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-border bg-background"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded text-xs font-bold",
                      isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      OPTION_LABELS[i]
                    )}
                  </span>
                  <span className="pt-0.5">{opt}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Yes/No */}
        {sub.format === QuestionFormat.YES_NO && (
          <div className="mb-3 flex flex-wrap gap-2">
            {["Yes", "No"].map((opt) => {
              const isCorrect = sub.correctAnswer === opt;
              return (
                <div
                  key={opt}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    isCorrect
                      ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCorrect && <CheckCircle2 className="size-4 text-green-500" />}
                  {!isCorrect && <XCircle className="size-4 text-muted-foreground/40" />}
                  {opt}
                </div>
              );
            })}
          </div>
        )}

        {/* Speech Recognition */}
        {sub.format === QuestionFormat.SPEECH_RECOGNITION && sub.expectedSpeech && (
          <PreviewField
            icon={Volume2}
            label={labels.admin.expectedSpeech}
            value={sub.expectedSpeech}
          />
        )}

        {/* Listening audio */}
        {sub.skill === QuestionSkill.LISTENING && sub.audioUrl && (
          <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Headphones className="size-3" />
              Audio
            </p>
            <audio controls src={sub.audioUrl} className="h-9 w-full" />
          </div>
        )}

        {/* Essay rubric */}
        {sub.format === QuestionFormat.ESSAY && sub.essayRubric && (
          <PreviewField
            icon={PenLine}
            label={labels.admin.essayRubric}
            value={sub.essayRubric}
          />
        )}

        {/* Explanation */}
        {sub.explanation && (
          <PreviewField
            label={labels.admin.explanationLabel}
            value={sub.explanation}
            muted
          />
        )}
      </div>
    </div>
  );
}

function PreviewField({
  icon: Icon,
  label,
  value,
  muted = false,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="mb-2 flex flex-col gap-1.5">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {Icon && <Icon className="size-3" />}
        {label}
      </p>
      <div
        className={cn(
          "whitespace-pre-wrap rounded-lg border px-3 py-2.5 text-sm leading-relaxed",
          muted
            ? "border-border bg-muted/40 text-muted-foreground"
            : "border-border bg-background"
        )}
      >
        {value}
      </div>
    </div>
  );
}
