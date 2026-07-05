"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LearnChatApiContext } from "@/components/student/chat-interface";
import { labels } from "@/lib/labels";

export type AiChatMessage = {
  id: number;
  role: "USER" | "ASSISTANT";
  message: string;
  createdAt?: string;
  responseMs?: number;
};

export type AiChatScope = {
  groupId?: number;
  chatContext?: LearnChatApiContext;
  messages: AiChatMessage[];
  headerTitle: string;
  headerSubtitle: string;
};

type AiChatScopeContextValue = {
  scope: AiChatScope;
  setScope: (partial: Partial<AiChatScope>) => void;
  resetScope: () => void;
};

const AiChatScopeContext = createContext<AiChatScopeContextValue | null>(null);

function buildDefaultScope(messages: AiChatMessage[]): AiChatScope {
  return {
    groupId: undefined,
    chatContext: undefined,
    messages,
    headerTitle: labels.student.aiAssistantTitle,
    headerSubtitle: labels.student.chatSubtitle,
  };
}

export function AiChatScopeProvider({
  children,
  defaultMessages,
}: {
  children: ReactNode;
  defaultMessages: AiChatMessage[];
}) {
  const defaultScope = useMemo(
    () => buildDefaultScope(defaultMessages),
    [defaultMessages]
  );
  const [scope, setScopeState] = useState<AiChatScope>(defaultScope);

  const setScope = useCallback((partial: Partial<AiChatScope>) => {
    setScopeState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetScope = useCallback(() => {
    setScopeState(defaultScope);
  }, [defaultScope]);

  return (
    <AiChatScopeContext.Provider value={{ scope, setScope, resetScope }}>
      {children}
    </AiChatScopeContext.Provider>
  );
}

export function useAiChatScope() {
  const context = useContext(AiChatScopeContext);
  if (!context) {
    throw new Error("useAiChatScope must be used within AiChatScopeProvider");
  }
  return context;
}
