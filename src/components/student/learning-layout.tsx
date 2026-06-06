"use client";

import { useState, type ReactNode } from "react";
import { List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LearningAiMobileButton,
  LearningAiPanel,
} from "@/components/student/learning-ai-panel";
import { LearningAiPanelProvider } from "@/components/student/learning-ai-context";
import { LearningStepsPanel } from "@/components/student/learning-steps-panel";
import { LearningStepsPanelProvider } from "@/components/student/learning-steps-context";
import type { LearnChatApiContext } from "@/components/student/chat-interface";
import { labels } from "@/lib/labels";

type ChatMessage = {
  id: number;
  role: "USER" | "ASSISTANT";
  message: string;
};

export function LearningLayout({
  sidebar,
  children,
  mobileTitle,
  mobileSubtitle,
  groupId,
  groupTitle,
  stepSubtitle,
  chatContext,
  initialChatMessages,
  showAiPanel = true,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  mobileTitle?: string;
  mobileSubtitle?: string;
  groupId: number;
  groupTitle: string;
  stepSubtitle: string;
  chatContext: LearnChatApiContext;
  initialChatMessages: ChatMessage[];
  showAiPanel?: boolean;
}) {
  const [stepsOpen, setStepsOpen] = useState(false);

  const sidebarPanel = (
    <nav className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {sidebar}
    </nav>
  );

  return (
    <LearningStepsPanelProvider>
      <LearningAiPanelProvider>
        <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
          {/* Mobile top bar */}
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm lg:hidden">
            <Sheet open={stepsOpen} onOpenChange={setStepsOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-2 shrink-0">
                  <List className="size-4" />
                  {labels.nav.openSteps}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex h-full flex-col p-0 pb-safe w-[min(22rem,92vw)]">
                <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                  <SheetTitle className="text-sm font-bold">
                    {labels.student.learningPath}
                  </SheetTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setStepsOpen(false)}
                    aria-label={labels.nav.closeSteps}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">{sidebarPanel}</div>
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              {mobileTitle && (
                <p className="truncate text-sm font-semibold">{mobileTitle}</p>
              )}
              {mobileSubtitle && (
                <p className="truncate text-xs text-muted-foreground">{mobileSubtitle}</p>
              )}
            </div>

            {showAiPanel && <LearningAiMobileButton />}
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-stretch overflow-hidden md:flex-row md:items-stretch md:gap-6">
            <LearningStepsPanel>{sidebar}</LearningStepsPanel>

            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain self-stretch">
              {children}
            </main>

            {showAiPanel && (
              <LearningAiPanel
                groupId={groupId}
                groupTitle={groupTitle}
                stepSubtitle={stepSubtitle}
                chatContext={chatContext}
                initialMessages={initialChatMessages}
              />
            )}
          </div>
        </div>
      </LearningAiPanelProvider>
    </LearningStepsPanelProvider>
  );
}
