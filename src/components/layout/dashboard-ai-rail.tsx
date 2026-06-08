"use client";

import { Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/student/chat-interface";
import { CollapsibleLearnRail } from "@/components/student/collapsible-learn-rail";
import { useAiChatScope } from "@/components/layout/ai-chat-scope-context";
import { useDashboardAiPanel } from "@/components/layout/dashboard-ai-context";
import { labels } from "@/lib/labels";

export function DashboardAiRail() {
  const { scope } = useAiChatScope();
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useDashboardAiPanel();

  const quickPrompts = [
    labels.student.aiQuickExplain,
    labels.student.aiQuickExample,
    labels.student.aiQuickHelp,
  ];

  const chatBody = (
    <ChatInterface
      key={scope.groupId ?? "general"}
      variant="compact"
      groupId={scope.groupId}
      chatContext={scope.chatContext}
      initialMessages={scope.messages}
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
          <p className="truncate text-sm font-bold">{scope.headerTitle}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {scope.headerSubtitle}
          </p>
        </div>
      </div>
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
        className="h-full"
        desktopBreakpoint="lg"
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

export function DashboardAiMobileButton() {
  const { setMobileOpen } = useDashboardAiPanel();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2 shrink-0 lg:hidden"
      onClick={() => setMobileOpen(true)}
    >
      <Sparkles className="size-4" />
      {labels.student.askAi}
    </Button>
  );
}
