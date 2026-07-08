"use client";

import { useRef, useState, useTransition } from "react";
import { FileText, Loader2, Sparkles, Upload, X } from "lucide-react";
import { MaterialForm } from "@/components/admin/content-builder/material-form";
import { QuestionForm } from "@/components/admin/content-builder/question-form";
import type { AiCopilotResult } from "@/lib/ai-copilot";
import type { SubQuestion } from "@/lib/sub-questions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { labels } from "@/lib/labels";

type ContentType = "material" | "question";

export function AiContentGenerator({
  levelId,
  groupId,
}: {
  levelId: number;
  groupId: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType>("question");
  const [draft, setDraft] = useState<AiCopilotResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hasSource = Boolean(topic.trim() || sourceText.trim());

  async function readSourceFile(file: File) {
    const text = await file.text();
    setSourceText(text);
    setSourceFileName(file.name);
  }

  function clearSourceFile() {
    setSourceText("");
    setSourceFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleGenerate() {
    setError(null);
    setDraft(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/ai/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: contentType,
            topic: topic.trim() || undefined,
            sourceText: sourceText.trim() || undefined,
          }),
        });
        const json = (await response.json()) as AiCopilotResult & {
          error?: string;
        };
        if (!response.ok) {
          setError(json.error ?? labels.admin.aiCopilotError);
          return;
        }
        setDraft(json);
      } catch {
        setError(labels.admin.aiCopilotError);
      }
    });
  }

  function handleReset() {
    setDraft(null);
    setError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-5 text-primary" />
            {labels.admin.aiCopilot}
          </CardTitle>
          <CardDescription>{labels.admin.aiCopilotHint}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ai-topic">{labels.admin.aiCopilotTopic}</Label>
            <Input
              id="ai-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={labels.admin.aiCopilotTopicPlaceholder}
              className="min-h-11"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ai-source-file">{labels.admin.aiCopilotSourceFile}</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="ai-source-file"
                ref={fileRef}
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                className="min-h-11"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void readSourceFile(file);
                }}
              />
              {sourceFileName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11 gap-2"
                  onClick={clearSourceFile}
                >
                  <X className="size-4" />
                  {labels.admin.aiCopilotClearFile}
                </Button>
              )}
            </div>
            {sourceFileName && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="size-3.5 shrink-0" />
                {labels.admin.aiCopilotFileLoaded(sourceFileName)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {labels.admin.aiCopilotSourceFileHint}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ai-content-type">{labels.admin.aiCopilotContentType}</Label>
            <select
              id="ai-content-type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="native-select min-h-11"
            >
              <option value="question">{labels.admin.aiCopilotTypeQuestion}</option>
              <option value="material">{labels.admin.aiCopilotTypeMaterial}</option>
            </select>
            <p className="text-xs text-muted-foreground">
              {contentType === "question"
                ? labels.admin.aiCopilotQuestionTemplateHint
                : labels.admin.aiCopilotMaterialHint}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              disabled={pending || !hasSource}
              className="min-h-11 w-full gap-2 sm:w-auto"
              onClick={handleGenerate}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {pending
                ? labels.admin.aiCopilotGenerating
                : labels.admin.aiCopilotGenerate}
            </Button>
            {draft && (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full gap-2 sm:w-auto"
                onClick={handleReset}
              >
                <Upload className="size-4" />
                {labels.admin.aiCopilotStartOver}
              </Button>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {draft?.type === "material" && (
        <MaterialForm
          key={`material-${draft.title}`}
          levelId={levelId}
          groupId={groupId}
          initialValues={{
            title: draft.title,
            content: draft.content,
          }}
        />
      )}

      {draft?.type === "question" && (
        <div className="flex flex-col gap-3">
          {draft.validationWarning && (
            <div
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100"
              role="status"
            >
              {labels.admin.aiCopilotValidationWarning(draft.validationWarning)}
            </div>
          )}
          <QuestionForm
            key={draft.subQuestions.map((s: SubQuestion) => s.id).join("-")}
            levelId={levelId}
            groupId={groupId}
            initialSubQuestions={draft.subQuestions}
          />
        </div>
      )}
    </div>
  );
}
