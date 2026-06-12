"use client";

import { ChevronRight, Sparkles } from "lucide-react";
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
import { ChatInterface, type LearnChatApiContext } from "@/components/student/chat-interface";
import { useLearningAiPanel } from "@/components/student/learning-ai-context";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

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

  return (
    <>
      <div
        className={cn(
          "relative hidden shrink-0 transition-[width] duration-200 ease-in-out md:block",
          collapsed ? "w-16" : "w-72 xl:w-80",
          "h-full min-h-0 self-stretch"
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
                <div className="shrink-0 border-b border-sidebar-border bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {labels.student.aiAssistantTitle}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {groupTitle}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 truncate text-xs text-violet-700/80 dark:text-violet-300/80">
                    {stepSubtitle}
                  </p>
                </div>

                <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
                  <ChatInterface
                    variant="compact"
                    groupId={groupId}
                    chatContext={chatContext}
                    initialMessages={initialMessages}
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
          aria-label={labels.student.aiAssistantClose}
          className={cn(
            "absolute left-0 top-6 z-10 size-7 -translate-x-1/2 rounded-full border-border bg-background shadow-md hover:bg-muted",
            collapsed && "hidden"
          )}
        >
          <ChevronRight className="size-3.5" />
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
                <p className="truncate text-sm font-semibold">
                  {labels.student.aiAssistantTitle}
                </p>
                <p className="truncate text-xs text-muted-foreground">{groupTitle}</p>
              </div>
            </div>
            <p className="mt-2 truncate text-xs text-violet-700/80 dark:text-violet-300/80">
              {stepSubtitle}
            </p>
          </div>
          <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
            <ChatInterface
              variant="compact"
              groupId={groupId}
              chatContext={chatContext}
              initialMessages={initialMessages}
              quickPrompts={quickPrompts}
              className="h-full min-h-0"
            />
          </div>
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
      className="min-h-11 shrink-0 gap-2 md:hidden"
      onClick={() => setMobileOpen(true)}
    >
      <Sparkles className="size-4" />
      {labels.student.askAi}
    </Button>
  );
}
