"use client";

import { useState, useTransition } from "react";
import { AssessmentPhase } from "@prisma/client";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import {
  createAssessmentQuestion,
  deleteAssessmentQuestion,
  updateAssessmentQuestion,
} from "@/actions/admin/assessments";
import type { AssessmentQuestionPayload } from "@/lib/assessments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IconButtonTooltip } from "@/components/ui/icon-button-tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { labels } from "@/lib/labels";

function PhaseSection({
  levelId,
  groupId,
  phase,
  title,
  questions,
  emptyLabel,
}: {
  levelId: number;
  groupId: number;
  phase: AssessmentPhase;
  title: string;
  questions: AssessmentQuestionPayload[];
  emptyLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  function handleAdd() {
    const text = draft.trim();
    if (!text) return;
    startTransition(async () => {
      await createAssessmentQuestion(groupId, levelId, phase, text);
      setDraft("");
    });
  }

  function handleSaveEdit(questionId: number) {
    const text = editText.trim();
    if (!text) return;
    startTransition(async () => {
      await updateAssessmentQuestion(questionId, groupId, levelId, text);
      setEditingId(null);
      setEditText("");
    });
  }

  function handleDelete(questionId: number) {
    startTransition(async () => {
      await deleteAssessmentQuestion(questionId, groupId, levelId);
    });
  }

  return (
    <Collapsible defaultOpen className="rounded-lg border border-border bg-card">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/40">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-primary" />
          <span className="font-semibold">{title}</span>
          <Badge variant="secondary">{questions.length}</Badge>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border px-4 py-4">
        <p className="mb-3 text-xs text-muted-foreground">
          {labels.admin.assessmentScaleHint}
        </p>

        {questions.length === 0 ? (
          <p className="mb-3 text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ol className="mb-4 flex flex-col gap-2">
            {questions.map((q, index) => (
              <li
                key={q.id}
                className="flex items-start gap-2 rounded-md border border-border bg-background p-3"
              >
                <span className="mt-0.5 shrink-0 text-xs font-semibold text-muted-foreground">
                  {index + 1}.
                </span>
                {editingId === q.id ? (
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="h-9"
                      disabled={pending}
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={pending || !editText.trim()}
                      onClick={() => handleSaveEdit(q.id)}
                    >
                      {labels.common.save}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      {labels.common.cancel}
                    </Button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left text-sm"
                      onClick={() => {
                        setEditingId(q.id);
                        setEditText(q.questionText);
                      }}
                    >
                      {q.questionText}
                    </button>
                    <IconButtonTooltip label={labels.admin.deleteAssessmentQuestion}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={pending}
                        onClick={() => handleDelete(q.id)}
                        aria-label={labels.admin.deleteAssessmentQuestion}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </IconButtonTooltip>
                  </>
                )}
              </li>
            ))}
          </ol>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={labels.admin.assessmentQuestionPlaceholder}
            disabled={pending}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button
            type="button"
            className="gap-2 sm:shrink-0"
            disabled={pending || !draft.trim()}
            onClick={handleAdd}
          >
            <Plus className="size-4" />
            {labels.admin.addAssessmentQuestion}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AssessmentEditor({
  levelId,
  groupId,
  pretest,
  posttest,
}: {
  levelId: number;
  groupId: number;
  pretest: AssessmentQuestionPayload[];
  posttest: AssessmentQuestionPayload[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-semibold">{labels.admin.assessmentsSection}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {labels.admin.assessmentsHint}
        </p>
      </div>
      <PhaseSection
        levelId={levelId}
        groupId={groupId}
        phase={AssessmentPhase.PRETEST}
        title={labels.admin.pretest}
        questions={pretest}
        emptyLabel={labels.admin.noPretestQuestions}
      />
      <PhaseSection
        levelId={levelId}
        groupId={groupId}
        phase={AssessmentPhase.POSTTEST}
        title={labels.admin.posttest}
        questions={posttest}
        emptyLabel={labels.admin.noPosttestQuestions}
      />
    </div>
  );
}
