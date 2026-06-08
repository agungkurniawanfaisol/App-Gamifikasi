"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { labels } from "@/lib/labels";
import { notifyPointsResult } from "@/lib/points-toast";
import { notifyChallengeCompletions } from "@/lib/challenge-toast";
import type { ChallengeCompletionResult } from "@/lib/challenge-service";
import type { LearnChatPhase } from "@/lib/ollama";

type Message = {
  id: number;
  role: "USER" | "ASSISTANT";
  message: string;
};

export type LearnChatApiContext = {
  phase: LearnChatPhase;
  stepLabel: string;
  stepContent?: string;
  groupTitle: string;
  levelName: string;
};

export function ChatInterface({
  initialMessages,
  variant = "default",
  groupId,
  chatContext,
  quickPrompts = [],
  className,
}: {
  initialMessages: Message[];
  variant?: "default" | "compact";
  groupId?: number;
  chatContext?: LearnChatApiContext;
  quickPrompts?: string[];
  className?: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isCompact = variant === "compact";

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setLoading(true);
    const userMsg: Message = {
      id: Date.now(),
      role: "USER",
      message: trimmed,
    };
    setMessages((m) => [...m, userMsg]);

    const assistantId = Date.now() + 1;
    setMessages((m) => [
      ...m,
      { id: assistantId, role: "ASSISTANT", message: "" },
    ]);

    try {
      const body: Record<string, unknown> = { message: trimmed };
      if (groupId != null) {
        body.groupId = groupId;
      }
      if (chatContext) {
        body.context = chatContext;
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok || !res.body) throw new Error("Chat failed");

      const pointsHeader = res.headers.get("X-Points-Awarded");
      if (pointsHeader) {
        const points = parseInt(pointsHeader, 10);
        notifyPointsResult({ pointsAwarded: points }, () => router.refresh());
      }

      const challengeHeader = res.headers.get("X-Challenge-Completions");
      if (challengeHeader) {
        try {
          const completions = JSON.parse(
            challengeHeader
          ) as ChallengeCompletionResult[];
          notifyChallengeCompletions(completions);
          router.refresh();
        } catch {
          /* ignore malformed header */
        }
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, message: accumulated }
              : msg
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, message: labels.student.chatError }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    await sendMessage(input);
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden",
        isCompact
          ? "h-full min-h-0 bg-transparent"
          : "surface-card min-h-[min(420px,60dvh)] max-h-[70dvh] sm:min-h-[480px] sm:max-h-[calc(100dvh-10rem)]",
        className
      )}
    >
      <ScrollArea
        className={cn(
          "h-0 min-h-0 flex-1",
          isCompact && "h-full",
          isCompact ? "p-3" : "p-4 sm:p-5"
        )}
      >
        <div className="flex flex-col gap-3">
          {messages.length === 0 && (
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-3 text-center",
                isCompact ? "py-8" : "py-16"
              )}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Sparkles className={cn(isCompact ? "size-5" : "size-6")} />
              </div>
              <p className="max-w-xs text-xs text-muted-foreground">
                {isCompact
                  ? labels.student.aiContextHint
                  : labels.student.chatSubtitle}
              </p>
              {quickPrompts.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={loading}
                      onClick={() => sendMessage(prompt)}
                      className="rounded-full border border-violet-500/25 bg-violet-500/5 px-3 py-1 text-[11px] font-medium text-violet-700 transition-colors hover:bg-violet-500/10 disabled:opacity-50 dark:text-violet-300"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[90%] rounded-lg text-sm leading-relaxed",
                isCompact ? "px-3 py-2 text-xs" : "px-4 py-3",
                msg.role === "USER"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto border border-border bg-muted"
              )}
            >
              {msg.message ||
                (loading && msg.role === "ASSISTANT" ? (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span className="text-foreground/80">
                      {labels.student.chatGenerating}
                    </span>
                    <span className="inline-flex gap-0.5" aria-hidden>
                      <span className="animate-pulse">●</span>
                      <span className="animate-pulse delay-100">●</span>
                      <span className="animate-pulse delay-200">●</span>
                    </span>
                  </span>
                ) : (
                  ""
                ))}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSend}
        className={cn(
          "shrink-0 flex flex-col gap-2 border-t border-border bg-card sm:flex-row sm:gap-3",
          isCompact ? "p-2.5" : "p-3 sm:p-4"
        )}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={labels.student.chatPlaceholder}
          disabled={loading}
          className="min-w-0 flex-1"
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full shrink-0 gap-2 sm:w-auto"
          size={isCompact ? "sm" : "default"}
        >
          <Send className="size-4" />
          {labels.student.chatSend}
        </Button>
      </form>
    </div>
  );
}
