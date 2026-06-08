"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
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
import { labels } from "@/lib/labels";

export function AiCopilotPanel() {
  const [topic, setTopic] = useState("");
  const [skill, setSkill] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generate(type: "mcq" | "material") {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/ai/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, topic, skill: skill || undefined }),
        });
        const json = await response.json();
        if (!response.ok) {
          setError(json.error ?? labels.admin.aiCopilotError);
          return;
        }
        setResult(JSON.stringify(json, null, 2));
      } catch {
        setError(labels.admin.aiCopilotError);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-5 text-primary" />
          {labels.admin.aiCopilot}
        </CardTitle>
        <CardDescription>{labels.admin.aiCopilotHint}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="copilot-topic">{labels.admin.aiCopilotTopic}</Label>
            <Input
              id="copilot-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={labels.admin.aiCopilotTopic}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="copilot-skill">{labels.admin.pickSkill}</Label>
            <select
              id="copilot-skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="native-select h-11"
            >
              <option value="">{labels.admin.filterAll}</option>
              <option value="READING">{labels.admin.skillReading}</option>
              <option value="WRITING">{labels.admin.skillWriting}</option>
              <option value="SPEAKING">{labels.admin.skillSpeaking}</option>
              <option value="LISTENING">{labels.admin.skillListening}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            disabled={pending || !topic.trim()}
            className="min-h-11 w-full sm:w-auto"
            onClick={() => generate("mcq")}
          >
            {pending
              ? labels.admin.aiCopilotGenerating
              : labels.admin.aiCopilotGenerateMcq}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending || !topic.trim()}
            className="min-h-11 w-full sm:w-auto"
            onClick={() => generate("material")}
          >
            {pending
              ? labels.admin.aiCopilotGenerating
              : labels.admin.aiCopilotGenerateMaterial}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {result && (
          <pre className="max-h-[480px] overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs leading-relaxed">
            <code>{result}</code>
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
