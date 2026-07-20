"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Plus,
  Loader2,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { QuestionFormat, QuestionSkill } from "@prisma/client";
import {
  createQuestionItem,
  updateQuestionItem,
} from "@/actions/admin/content-items";
import type { ContentItemPayload } from "@/lib/content-item";
import { getFormatLabel, getSkillLabel } from "@/lib/content-item";
import { groupEditPath } from "@/lib/content-routes";
import { FileUploadField } from "@/components/admin/content-builder/file-upload-field";
import { QuestionPreview } from "@/components/admin/content-builder/question-preview";
import { EditorPreviewLayout } from "@/components/admin/content-builder/editor-preview-layout";
import { useViewMode } from "@/lib/view-mode-context";
import { Button } from "@/components/ui/button";
import { IconButtonTooltip } from "@/components/ui/icon-button-tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { labels } from "@/lib/labels";
import { toast } from "sonner";
import {
  createEmptySubQuestion,
  getFormatsForSkill,
  getTotalWeight,
  normalizeSubQuestionsForSave,
  syncMcqCorrectAnswer,
  syncYesNoCorrectAnswer,
  type SubQuestion,
} from "@/lib/sub-questions";
import { cn } from "@/lib/utils";

function getInitialCorrect(opts: string[], correctAnswer: string | null): string {
  const idx = opts.findIndex((opt) => opt === correctAnswer);
  return idx >= 0 ? String.fromCharCode(65 + idx) : "";
}

/** Styled select wrapper for consistency */
function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <select
        className="native-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SubQuestionEditor({
  sub,
  index,
  total,
  groupId,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canRemove,
}: {
  sub: SubQuestion;
  index: number;
  total: number;
  groupId: number;
  onChange: (updated: SubQuestion) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canRemove: boolean;
}) {
  const [open, setOpen] = useState(true);
  const formats = getFormatsForSkill(sub.skill);
  const mcqOpts = sub.options ?? ["", "", "", ""];
  const correctLetter = getInitialCorrect(mcqOpts, sub.correctAnswer ?? null);
  const yesNoAnswer = syncYesNoCorrectAnswer(sub.correctAnswer);

  function update(patch: Partial<SubQuestion>) {
    onChange({ ...sub, ...patch });
  }

  function handleSkillChange(skill: QuestionSkill) {
    const nextFormats = getFormatsForSkill(skill);
    const format = nextFormats.includes(sub.format)
      ? sub.format
      : nextFormats[0]!;
    update({
      skill,
      format,
      options:
        format === QuestionFormat.MULTIPLE_CHOICE
          ? ["", "", "", ""]
          : format === QuestionFormat.YES_NO
            ? ["Yes", "No"]
            : undefined,
      correctAnswer: format === QuestionFormat.YES_NO ? "Yes" : "",
      audioUrl: skill === QuestionSkill.LISTENING ? sub.audioUrl : undefined,
    });
  }

  function handleFormatChange(format: QuestionFormat) {
    update({
      format,
      options:
        format === QuestionFormat.MULTIPLE_CHOICE
          ? ["", "", "", ""]
          : format === QuestionFormat.YES_NO
            ? ["Yes", "No"]
            : undefined,
      correctAnswer: format === QuestionFormat.YES_NO ? "Yes" : "",
    });
  }

  const skillOptions = Object.values(QuestionSkill).map((s) => ({
    value: s,
    label: getSkillLabel(s),
  }));
  const formatOptions = formats.map((f) => ({
    value: f,
    label: getFormatLabel(f),
  }));

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="surface-card overflow-hidden">
        {/* Sub-question header bar */}
        <div className="flex flex-col gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  open && "rotate-180"
                )}
              />
              <span className="font-semibold">
                {labels.admin.subQuestionOf(index + 1, total)}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="gap-1.5">
                  {getSkillLabel(sub.skill)}
                </Badge>
                <Badge variant="secondary">{getFormatLabel(sub.format)}</Badge>
                <Badge variant="outline">{sub.weightPercent}%</Badge>
              </div>
            </button>
          </CollapsibleTrigger>
          <div className="flex flex-wrap gap-1.5">
            <IconButtonTooltip label={labels.admin.moveUp}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11"
                disabled={index === 0}
                onClick={onMoveUp}
                aria-label={labels.admin.moveUp}
              >
                <ChevronUp className="size-4" />
              </Button>
            </IconButtonTooltip>
            <IconButtonTooltip label={labels.admin.moveDown}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11"
                disabled={index === total - 1}
                onClick={onMoveDown}
                aria-label={labels.admin.moveDown}
              >
                <ChevronDown className="size-4" />
              </Button>
            </IconButtonTooltip>
            {canRemove && (
              <IconButtonTooltip label={labels.admin.removeSubQuestion}>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="size-11"
                  onClick={onRemove}
                  aria-label={labels.admin.removeSubQuestion}
                >
                  <Trash2 className="size-4" />
                </Button>
              </IconButtonTooltip>
            )}
          </div>
        </div>

        <CollapsibleContent>
          <div className="flex flex-col gap-5 p-4">
            {/* Row: Skill / Format / Weight */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormSelect
                label={labels.admin.pickSkill}
                value={sub.skill}
                onChange={(v) => handleSkillChange(v as QuestionSkill)}
                options={skillOptions}
              />
              <FormSelect
                label={labels.admin.pickFormat}
                value={sub.format}
                onChange={(v) => handleFormatChange(v as QuestionFormat)}
                options={formatOptions}
              />
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {labels.admin.weightPercent}
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={sub.weightPercent}
                  onChange={(e) =>
                    update({ weightPercent: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {labels.admin.questionTextLabel}
              </Label>
              <Textarea
                value={sub.questionText}
                onChange={(e) => update({ questionText: e.target.value })}
                rows={3}
                placeholder="Type your question here..."
              />
            </div>

            {/* Listening audio upload */}
            {sub.skill === QuestionSkill.LISTENING && (
              <FileUploadField
                groupId={groupId}
                accept="audio/*"
                label={labels.admin.uploadAudio}
                currentUrl={sub.audioUrl ?? ""}
                onUploaded={(url) => update({ audioUrl: url })}
              />
            )}

            {/* Multiple Choice options */}
            {sub.format === QuestionFormat.MULTIPLE_CHOICE && (
              <div className="flex flex-col gap-3">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {labels.admin.answerOptions}
                </Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-muted-foreground w-5 shrink-0">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <Input
                        value={mcqOpts[i] ?? ""}
                        onChange={(e) => {
                          const next = [...mcqOpts];
                          next[i] = e.target.value;
                          update({
                            options: next,
                            correctAnswer: syncMcqCorrectAnswer(
                              next,
                              sub.correctAnswer
                            ),
                          });
                        }}
                        placeholder={
                          [labels.admin.optionA, labels.admin.optionB, labels.admin.optionC, labels.admin.optionD][i]
                        }
                      />
                    </div>
                  ))}
                </div>
                <FormSelect
                  label={labels.admin.correctAnswer}
                  value={correctLetter}
                  onChange={(v) => {
                    if (!v) {
                      update({ correctAnswer: "" });
                      return;
                    }
                    const keyMap: Record<string, number> = {
                      A: 0, B: 1, C: 2, D: 3,
                    };
                    const idx = keyMap[v] ?? 0;
                    update({ correctAnswer: mcqOpts[idx]?.trim() ?? "" });
                  }}
                  options={[
                    { value: "", label: labels.admin.selectCorrectAnswer },
                    { value: "A", label: `A — ${mcqOpts[0] || "(empty)"}` },
                    { value: "B", label: `B — ${mcqOpts[1] || "(empty)"}` },
                    { value: "C", label: `C — ${mcqOpts[2] || "(empty)"}` },
                    { value: "D", label: `D — ${mcqOpts[3] || "(empty)"}` },
                  ]}
                />
              </div>
            )}

            {/* Yes/No answer */}
            {sub.format === QuestionFormat.YES_NO && (
              <FormSelect
                label={labels.admin.correctAnswer}
                value={yesNoAnswer}
                onChange={(v) => update({ correctAnswer: syncYesNoCorrectAnswer(v) })}
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
              />
            )}

            {/* Speech Recognition */}
            {sub.format === QuestionFormat.SPEECH_RECOGNITION && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {labels.admin.expectedSpeech}
                </Label>
                <Textarea
                  value={sub.expectedSpeech ?? ""}
                  onChange={(e) => update({ expectedSpeech: e.target.value })}
                  rows={2}
                  placeholder="The expected sentence the student should say..."
                />
              </div>
            )}

            {/* Essay rubric */}
            {sub.format === QuestionFormat.ESSAY && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {labels.admin.essayRubric}
                </Label>
                <Textarea
                  value={sub.essayRubric ?? ""}
                  onChange={(e) => update({ essayRubric: e.target.value })}
                  rows={2}
                  placeholder="Rubric for grading the essay..."
                />
              </div>
            )}

            {/* Explanation */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {labels.admin.explanationLabel}
              </Label>
              <Textarea
                value={sub.explanation ?? ""}
                onChange={(e) => update({ explanation: e.target.value })}
                placeholder={labels.admin.explanationOptional}
                rows={2}
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function QuestionForm({
  levelId,
  groupId,
  item,
  initialSubQuestions,
}: {
  levelId: number;
  groupId: number;
  item?: ContentItemPayload;
  initialSubQuestions?: SubQuestion[];
}) {
  const { viewMode, setViewMode } = useViewMode();

  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>(
    () =>
      item?.subQuestions?.length
        ? item.subQuestions
        : initialSubQuestions?.length
          ? initialSubQuestions
          : [createEmptySubQuestion()]
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const listPath = groupEditPath(levelId, groupId);

  const totalWeight = useMemo(
    () => getTotalWeight(subQuestions),
    [subQuestions]
  );

  const weightValid = totalWeight === 100;
  const weightStatus =
    totalWeight === 100
      ? labels.admin.weightValid
      : totalWeight < 100
        ? labels.admin.weightNeedMore(100 - totalWeight)
        : labels.admin.weightOver(totalWeight - 100);

  function updateSub(index: number, updated: SubQuestion) {
    setSubQuestions((prev) => prev.map((sq, i) => (i === index ? updated : sq)));
  }

  function addSub() {
    setSubQuestions((prev) => {
      const seedQuestionText = prev[0]?.questionText?.trim() ?? "";
      const nextSub = createEmptySubQuestion(prev.length);
      return [
        ...prev,
        seedQuestionText
          ? { ...nextSub, questionText: seedQuestionText }
          : nextSub,
      ];
    });
  }

  function removeSub(index: number) {
    setSubQuestions((prev) =>
      prev.filter((_, i) => i !== index).map((sq, i) => ({ ...sq, order: i }))
    );
  }

  function moveSub(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= subQuestions.length) return;
    setSubQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index]!;
      copy[index] = copy[next]!;
      copy[next] = temp;
      return copy.map((sq, i) => ({ ...sq, order: i }));
    });
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const seedQuestionText = subQuestions[0]?.questionText?.trim() ?? "";
        const withSeedText = subQuestions.map((sq) =>
          !sq.questionText.trim() && seedQuestionText
            ? { ...sq, questionText: seedQuestionText }
            : sq
        );
        const normalizedSubQuestions = normalizeSubQuestionsForSave(withSeedText);

        const data = { subQuestions: normalizedSubQuestions };
        const result = item
          ? await updateQuestionItem(item.id, groupId, levelId, data)
          : await createQuestionItem(groupId, levelId, data);

        if (result?.error) {
          setError(result.error);
          return;
        }
        toast.success(labels.admin.saveSuccess);
      } catch (err) {
        // redirect() throws; rethrow so navigation still works
        if (
          err &&
          typeof err === "object" &&
          "digest" in err &&
          String((err as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
        ) {
          throw err;
        }
        setError(labels.admin.saveFailed);
      }
    });
  }

  const previewItem: ContentItemPayload = {
    id: item?.id ?? 0,
    groupId,
    type: "QUESTION",
    order: item?.order ?? 0,
    title: null,
    content: null,
    questionText: null,
    skill: null,
    format: null,
    options: null,
    correctAnswer: null,
    expectedSpeech: null,
    audioUrl: null,
    explanation: null,
    essayRubric: null,
    subQuestions,
  };

  const editor = (
    <div className="flex flex-col gap-5">
      {/* Weight progress indicator */}
      <div className="surface-elevated p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{labels.admin.totalWeight(totalWeight)}</span>
            <Badge variant={weightValid ? "success" : "destructive"} className="text-[10px]">
              {weightValid ? "OK" : `${totalWeight}%`}
            </Badge>
          </div>
          <span className={cn(
            "text-xs",
            weightValid ? "text-success" : "text-destructive"
          )}>
            {weightStatus}
          </span>
        </div>
        <Progress
          value={Math.min(totalWeight, 100)}
          className="mt-2 h-1.5"
          indicatorClassName={cn(
            weightValid && "bg-success",
            !weightValid && totalWeight < 100 && "bg-amber-500",
            totalWeight > 100 && "bg-destructive"
          )}
        />
      </div>

      {/* Sub-questions list */}
      <div className="flex flex-col gap-3">
        {subQuestions.map((sub, index) => (
          <SubQuestionEditor
            key={sub.id}
            sub={sub}
            index={index}
            total={subQuestions.length}
            groupId={groupId}
            onChange={(updated) => updateSub(index, updated)}
            onRemove={() => removeSub(index)}
            onMoveUp={() => moveSub(index, -1)}
            onMoveDown={() => moveSub(index, 1)}
            canRemove={subQuestions.length > 1}
          />
        ))}
      </div>

      {/* Add sub-question button */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 border-dashed sm:w-auto"
        onClick={addSub}
      >
        <Plus className="size-4" />
        {labels.admin.addSubQuestion}
      </Button>

      {/* Error */}
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="sticky bottom-0 z-10 -mx-5 flex flex-col-reverse gap-2 border-t border-border bg-background/95 px-5 py-4 pb-safe backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:flex-row sm:justify-end sm:bg-transparent sm:px-0 sm:py-0 sm:pb-0 sm:backdrop-blur-none">
        <Button
          type="button"
          disabled={pending || !weightValid}
          onClick={handleSave}
          className="min-h-11 w-full gap-2 sm:w-auto"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {pending ? labels.admin.saving : labels.common.save}
        </Button>
        <Button type="button" variant="outline" asChild className="w-full gap-2 sm:w-auto">
          <Link href={listPath}>
            <X className="size-4" />
            {labels.common.cancel}
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="surface-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HelpCircle className="size-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold">
            {item ? labels.common.edit : labels.admin.addQuestion}
          </h3>
          <p className="text-xs text-muted-foreground">
            {item
              ? `${labels.admin.contentItemMeta(item.id, item.order)} · ${labels.admin.subQuestionsCount(subQuestions.length)}`
              : labels.admin.typeQuestionDesc}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <EditorPreviewLayout
          mode={viewMode}
          onModeChange={setViewMode}
          editor={editor}
          preview={<QuestionPreview item={previewItem} />}
        />
      </div>
    </div>
  );
}
