"use client";

import { useEffect } from "react";
import type { LearnChatApiContext } from "@/components/student/chat-interface";
import {
  type AiChatMessage,
  useAiChatScope,
} from "@/components/layout/ai-chat-scope-context";

export function LearnAiScopeSync({
  groupId,
  groupTitle,
  chatContext,
  messages,
}: {
  groupId: number;
  groupTitle: string;
  chatContext: LearnChatApiContext;
  messages: AiChatMessage[];
}) {
  const { setScope, resetScope } = useAiChatScope();

  useEffect(() => {
    setScope({
      groupId,
      chatContext,
      messages,
      headerTitle: groupTitle,
      headerSubtitle: chatContext.stepLabel,
    });
  }, [groupId, groupTitle, chatContext, messages, setScope]);

  useEffect(() => {
    return () => resetScope();
  }, [resetScope]);

  return null;
}
