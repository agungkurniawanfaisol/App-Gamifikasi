"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageTime } from "@/components/chat/chat-message-time";
import { cn } from "@/lib/utils";
import { labels } from "@/lib/labels";
import { notifyPointsResult } from "@/lib/points-toast";
import { notifyChallengeCompletions } from "@/lib/challenge-toast";
import type { ChallengeCompletionResult } from "@/lib/challenge-service";
import {
  formatResponseDuration,
  type ChatMessageMeta,
} from "@/lib/chat-message-meta";
import type { LearnChatPhase } from "@/lib/ollama";

export type ChatMessage = ChatMessageMeta;

export type LearnChatApiContext = {
  phase: LearnChatPhase;
  stepLabel: string;
  stepContent?: string;
  groupTitle: string;
  levelName: string;
};

const TEXTAREA_MAX_HEIGHT = 128;

export function ChatInterface({
  initialMessages,
  variant = "default",
  groupId,
  chatContext,
  quickPrompts = [],
  className,
}: {
  initialMessages: ChatMessage[];
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sentAtRef = useRef<number | null>(null);
  const [generatingElapsedMs, setGeneratingElapsedMs] = useState(0);
  const isCompact = variant === "compact";

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  useEffect(() => {
    if (!loading || sentAtRef.current == null) {
      setGeneratingElapsedMs(0);
      return;
    }

    const tick = () => {
      setGeneratingElapsedMs(Date.now() - sentAtRef.current!);
    };
    tick();
    const intervalId = window.setInterval(tick, 500);
    return () => window.clearInterval(intervalId);
  }, [loading]);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > TEXTAREA_MAX_HEIGHT ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setLoading(true);
    const sentAt = Date.now();
    sentAtRef.current = sentAt;
    const userCreatedAt = new Date(sentAt).toISOString();
    const userMsg: ChatMessage = {
      id: sentAt,
      role: "USER",
      message: trimmed,
      createdAt: userCreatedAt,
    };
    setMessages((m) => [...m, userMsg]);

    const assistantId = sentAt + 1;
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
        signal: AbortSignal.timeout(180_000),
      });
      if (!res.ok || !res.body) throw new Error(`Chat failed: ${res.status}`);

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
      let rafId: number | null = null;

      const flushStream = () => {
        rafId = null;
        const snapshot = accumulated;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, message: snapshot } : msg
          )
        );
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        if (rafId == null) {
          rafId = requestAnimationFrame(flushStream);
        }
      }

      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }

      const completedAt = Date.now();
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                message: accumulated,
                createdAt: new Date(completedAt).toISOString(),
                responseMs: completedAt - sentAt,
              }
            : msg
        )
      );
    } catch (err) {
      const completedAt = Date.now();
      const isTimeout =
        err instanceof DOMException && err.name === "TimeoutError";
      const isNetwork =
        err instanceof TypeError ||
        (err instanceof Error && /failed|network|fetch/i.test(err.message));
      const errorMessage = isTimeout
        ? labels.student.chatTimeoutError
        : isNetwork
          ? labels.student.chatNetworkError
          : labels.student.chatError;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                message: errorMessage,
                createdAt: new Date(completedAt).toISOString(),
                responseMs: completedAt - sentAt,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
      sentAtRef.current = null;
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    await sendMessage(input);
  }

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
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
      <p
        className={cn(
          "shrink-0 border-b border-sidebar-border bg-muted/30 text-muted-foreground",
          isCompact
            ? "px-3 py-2 text-[10px] leading-snug"
            : "px-4 py-2.5 text-xs leading-snug sm:px-5"
        )}
      >
        {labels.student.chatDailyResetHint}
      </p>
      <ScrollArea
        className={cn(
          "h-0 min-h-0 flex-1",
          isCompact ? "p-3" : "p-4 sm:p-5"
        )}
      >
        <div className="flex flex-col gap-3" role="log" aria-live="polite" aria-relevant="additions">
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
          {messages.map((msg) => {
            const isStreamingAssistant =
              loading && msg.role === "ASSISTANT" && !msg.message;

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex max-w-[90%] flex-col",
                  msg.role === "USER" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "w-full rounded-lg text-sm leading-relaxed break-words",
                    isCompact ? "px-3 py-2 text-xs" : "px-4 py-3",
                    msg.role === "USER"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-muted"
                  )}
                >
                  {msg.message ||
                    (isStreamingAssistant ? (
                      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
                        <span className="inline-flex items-center gap-2 text-foreground/80">
                          {generatingElapsedMs > 0
                            ? labels.student.chatGeneratingElapsed(
                                formatResponseDuration(generatingElapsedMs)
                              )
                            : labels.student.chatGenerating}
                          <span className="inline-flex gap-0.5" aria-hidden>
                            <span className="animate-pulse">●</span>
                            <span className="animate-pulse delay-100">●</span>
                            <span className="animate-pulse delay-200">●</span>
                          </span>
                        </span>
                      </span>
                    ) : (
                      ""
                    ))}
                </div>
                {!isStreamingAssistant && msg.createdAt && (
                  <ChatMessageTime
                    createdAt={msg.createdAt}
                    responseMs={msg.responseMs}
                    role={msg.role}
                    isCompact={isCompact}
                    className="text-muted-foreground"
                  />
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSend}
        className={cn(
          "flex shrink-0 flex-col gap-2 border-t border-sidebar-border bg-sidebar",
          isCompact ? "p-3" : "p-3 sm:p-4"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder={labels.student.chatPlaceholder}
          disabled={loading}
          rows={1}
          aria-label={labels.student.chatPlaceholder}
          className={cn(
            "min-h-11 min-w-0 w-full resize-none overflow-x-hidden whitespace-pre-wrap break-words py-3",
            isCompact ? "text-sm" : "text-base md:text-sm"
          )}
          style={{ maxHeight: TEXTAREA_MAX_HEIGHT }}
        />
        <p
          className={cn(
            "text-muted-foreground",
            isCompact ? "text-[10px] leading-snug" : "text-xs leading-snug"
          )}
        >
          {labels.student.chatKeyboardHint}
        </p>
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="min-h-11 w-full shrink-0 gap-2 self-end sm:w-auto"
          size={isCompact ? "sm" : "default"}
          aria-label={loading ? labels.student.chatSending : labels.student.chatSend}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {loading ? labels.student.chatSending : labels.student.chatSend}
        </Button>
      </form>
    </div>
  );
}
