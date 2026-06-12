"use client";

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatInterface } from "@/components/student/chat-interface";
import { useAiChatScope } from "@/components/layout/ai-chat-scope-context";
import { useDashboardAiPanel } from "@/components/layout/dashboard-ai-context";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function DashboardAiRail() {
  const { scope } = useAiChatScope();
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useDashboardAiPanel();

  const quickPrompts = [
    labels.student.aiQuickExplain,
    labels.student.aiQuickExample,
    labels.student.aiQuickHelp,
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 hidden h-dvh transition-[width] duration-200 ease-in-out lg:block",
          collapsed ? "w-16" : "w-72 xl:w-80"
        )}
      >
        <aside className="h-full overflow-hidden border-l border-sidebar-border bg-sidebar">
          <div className="flex h-full flex-col overflow-hidden">
            {collapsed ? (
              <div className="flex h-full flex-col items-center pt-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggle}
                      className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 transition-colors hover:bg-violet-500/20 dark:text-violet-400"
                      aria-label={labels.student.aiAssistantExpand}
                    >
                      <Sparkles className="size-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {labels.student.aiAssistantOpen}
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <>
                <div className="shrink-0 border-b border-sidebar-border bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold tracking-tight">
                        {scope.headerTitle}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {scope.headerSubtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
                  <ChatInterface
                    key={scope.groupId ?? "general"}
                    variant="compact"
                    groupId={scope.groupId}
                    chatContext={scope.chatContext}
                    initialMessages={scope.messages}
                    quickPrompts={quickPrompts}
                    className="h-full min-h-0"
                  />
                </div>
              </>
            )}
          </div>
        </aside>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-label={
            collapsed
              ? labels.student.aiAssistantExpand
              : labels.student.aiAssistantClose
          }
          className="absolute left-0 top-6 z-50 size-7 -translate-x-1/2 rounded-full border-border bg-background shadow-md hover:bg-muted"
        >
          {collapsed ? (
            <ChevronLeft className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </Button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="flex h-full w-[min(22rem,92vw)] flex-col p-0">
          <SheetTitle className="sr-only">{labels.student.aiAssistantTitle}</SheetTitle>
          <div className="shrink-0 border-b border-sidebar-border bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                <Sparkles className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{scope.headerTitle}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {scope.headerSubtitle}
                </p>
              </div>
            </div>
          </div>
          <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
            <ChatInterface
              key={scope.groupId ?? "general"}
              variant="compact"
              groupId={scope.groupId}
              chatContext={scope.chatContext}
              initialMessages={scope.messages}
              quickPrompts={quickPrompts}
              className="h-full min-h-0"
            />
          </div>
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
      className="min-h-11 shrink-0 gap-2 lg:hidden"
      onClick={() => setMobileOpen(true)}
    >
      <Sparkles className="size-4" />
      {labels.student.askAi}
    </Button>
  );
}
