"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import {
  getChatConversationDetail,
  type ChatConversationDetail,
  type ChatMonitorEntry,
} from "@/actions/admin/chat-monitor";
import type { ChatMonitorDatePreset } from "@/lib/chat-day";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}

export function ChatConversationDetailDialog({
  entry,
  datePreset,
  onClose,
}: {
  entry: ChatMonitorEntry | null;
  datePreset: ChatMonitorDatePreset;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<ChatConversationDetail | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!entry) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    startTransition(async () => {
      const result = await getChatConversationDetail({
        userId: entry.userId,
        groupId: entry.groupId,
        datePreset,
      });
      if (!cancelled) setDetail(result);
    });

    return () => {
      cancelled = true;
    };
  }, [entry, datePreset]);

  return (
    <Dialog open={entry != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[92dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        {entry && (
          <>
            <div className="shrink-0 border-b border-border bg-gradient-to-br from-violet-500/15 via-primary/10 to-sky-500/10 px-4 py-4 sm:px-6 sm:py-5">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="text-lg sm:text-xl">
                  {labels.admin.chatMonitorDetailTitle}
                </DialogTitle>
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">{entry.userName}</p>
                  {detail?.userEmail && (
                    <p className="truncate text-sm text-muted-foreground">
                      {detail.userEmail}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {entry.groupTitle ?? labels.admin.chatMonitorGeneralChat}
                  </Badge>
                  {detail && (
                    <Badge variant="secondary">
                      {labels.admin.chatMonitorDetailMessageCount(
                        detail.messages.length
                      )}
                    </Badge>
                  )}
                </div>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {isPending && !detail ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {labels.admin.chatMonitorDetailLoading}
                </p>
              ) : !detail || detail.messages.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                  <MessageSquare className="size-8 opacity-50" aria-hidden />
                  <p>{labels.admin.chatMonitorDetailEmpty}</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {detail.messages.map((message) => {
                    const isAssistant = message.role === "ASSISTANT";
                    return (
                      <li
                        key={message.id}
                        className={cn(
                          "flex flex-col gap-1",
                          isAssistant ? "items-start" : "items-end"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isAssistant ? "secondary" : "outline"}
                            className="text-[10px]"
                          >
                            {isAssistant
                              ? labels.admin.chatMonitorRoleAssistant
                              : labels.admin.chatMonitorRoleUser}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDateTime(message.createdAt)}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "max-w-[95%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed sm:max-w-[85%]",
                            isAssistant
                              ? "rounded-tl-md border border-border bg-muted/60 text-foreground"
                              : "rounded-tr-md bg-primary text-primary-foreground"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.message}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="shrink-0 border-t border-border p-4 print:hidden sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full sm:w-auto"
                onClick={onClose}
              >
                {labels.admin.chatMonitorDetailClose}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
