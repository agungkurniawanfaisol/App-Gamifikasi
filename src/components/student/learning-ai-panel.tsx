"use client";

import { Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChatInterface, type LearnChatApiContext } from "@/components/student/chat-interface";
import { CollapsibleLearnRail } from "@/components/student/collapsible-learn-rail";
import { useLearningAiPanel } from "@/components/student/learning-ai-context";
import { labels } from "@/lib/labels";

type ChatMessage = {
  id: number;
  role: "USER" | "ASSISTANT";
  message: string;
};

export function LearningAiPanel({
  groupId,
  groupTitle,
  stepSubtitle,
  chatContext,
  initialMessages,
}: {
  groupId: number;
  groupTitle: string;
  stepSubtitle: string;
  chatContext: LearnChatApiContext;
  initialMessages: ChatMessage[];
}) {
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useLearningAiPanel();

  const quickPrompts = [
    labels.student.aiQuickExplain,
    labels.student.aiQuickExample,
    labels.student.aiQuickHelp,
  ];

  const chatBody = (
    <ChatInterface
      variant="compact"
      groupId={groupId}
      chatContext={chatContext}
      initialMessages={initialMessages}
      quickPrompts={quickPrompts}
      className="h-full min-h-0 rounded-none border-0 bg-transparent shadow-none"
    />
  );

  const panelHeader = (
    <div className="shrink-0 border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{labels.student.aiAssistantTitle}</p>
          <p className="truncate text-[11px] text-muted-foreground">{groupTitle}</p>
        </div>
      </div>
      <p className="mt-2 truncate text-xs text-violet-700/80 dark:text-violet-300/80">
        {stepSubtitle}
      </p>
    </div>
  );

  return (
    <>
      <CollapsibleLearnRail
        side="right"
        collapsed={collapsed}
        onToggle={toggle}
        collapsedIcon={Sparkles}
        collapsedTooltip={labels.student.aiAssistantOpen}
        toggleExpandLabel={labels.student.aiAssistantExpand}
        toggleCollapseLabel={labels.student.aiAssistantClose}
        panelClassName="border-violet-500/20"
        collapsedWidthClass="w-12"
        hideChildrenWhenCollapsed
      >
        {panelHeader}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{chatBody}</div>
      </CollapsibleLearnRail>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="flex w-[min(22rem,92vw)] flex-col p-0">
          <SheetTitle className="sr-only">{labels.student.aiAssistantTitle}</SheetTitle>
          {panelHeader}
          <div className="min-h-0 flex-1 overflow-hidden">{chatBody}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function LearningAiMobileButton() {
  const { setMobileOpen } = useLearningAiPanel();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2 shrink-0 md:hidden"
      onClick={() => setMobileOpen(true)}
    >
      <Sparkles className="size-4" />
      {labels.student.askAi}
    </Button>
  );
}
