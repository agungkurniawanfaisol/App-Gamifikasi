"use client";

import { useEffect, useState } from "react";
import { formatChatTimeWib } from "@/lib/format-date";
import { formatResponseDuration } from "@/lib/chat-message-meta";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function ChatMessageTime({
  createdAt,
  responseMs,
  role,
  isCompact = false,
  className,
}: {
  createdAt?: string;
  responseMs?: number;
  role: "USER" | "ASSISTANT";
  isCompact?: boolean;
  className?: string;
}) {
  const [timeText, setTimeText] = useState("");

  useEffect(() => {
    setTimeText(formatChatTimeWib(createdAt));
  }, [createdAt]);

  if (!createdAt) return null;

  const durationText =
    role === "ASSISTANT" && responseMs != null && responseMs > 0
      ? labels.student.chatRespondedIn(formatResponseDuration(responseMs))
      : null;

  return (
    <p
      className={cn(
        "mt-1.5 opacity-80",
        isCompact ? "text-[10px]" : "text-xs",
        className
      )}
      suppressHydrationWarning
    >
      {timeText || "\u00a0"}
      {durationText ? ` · ${durationText}` : null}
    </p>
  );
}
