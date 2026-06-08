"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ClipboardCheck,
  History,
  MessageSquareQuote,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import type { AdminProgressHistoryEventClient } from "@/lib/admin-user-progress";
import { formatAdminDate } from "@/lib/format-date";
import { getLevelLabel, labels } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EVENT_THEME: Record<
  AdminProgressHistoryEventClient["type"],
  { icon: typeof PlayCircle; badge: string }
> = {
  group_started: {
    icon: PlayCircle,
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  content_answer: {
    icon: Sparkles,
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  assessment_answer: {
    icon: ClipboardCheck,
    badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
  group_completed: {
    icon: CheckCircle2,
    badge: "bg-success/15 text-success",
  },
  testimonial: {
    icon: MessageSquareQuote,
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
};

function historyEventTitle(event: AdminProgressHistoryEventClient): string {
  switch (event.type) {
    case "group_started":
      return labels.admin.userProgress.historyGroupStarted(event.groupTitle);
    case "group_completed":
      return labels.admin.userProgress.historyGroupCompleted(
        event.groupTitle,
        event.detail ? parseInt(event.detail, 10) : null
      );
    case "content_answer":
      return labels.admin.userProgress.historyContentAnswer(event.label);
    case "assessment_answer":
      return labels.admin.userProgress.historyAssessmentAnswer(
        event.assessmentPhase === "posttest"
          ? labels.admin.posttest
          : labels.admin.pretest,
        event.label
      );
    case "testimonial":
      return labels.admin.userProgress.historyTestimonial(event.groupTitle);
    default:
      return event.label;
  }
}

export function UserProgressHistory({
  history,
  userId,
}: {
  history: AdminProgressHistoryEventClient[];
  userId: number;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <History className="size-4" />
        {labels.admin.userProgress.historyTitle}
      </h3>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {labels.admin.userProgress.historyEmpty}
        </p>
      ) : (
        <ol className="relative space-y-4 border-l border-border pl-5">
          {history.map((event) => {
            const theme = EVENT_THEME[event.type];
            const Icon = theme.icon;

            return (
              <li key={event.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[1.625rem] top-0.5 flex size-6 items-center justify-center rounded-full border border-border bg-card",
                    theme.badge
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium leading-snug">
                      {historyEventTitle(event)}
                    </p>
                    <Badge variant="outline" className="text-[10px]">
                      {getLevelLabel(event.levelName)}
                    </Badge>
                  </div>
                  {event.detail &&
                    event.type !== "group_completed" &&
                    event.type !== "assessment_answer" && (
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {event.detail}
                      </p>
                    )}
                  {event.type === "assessment_answer" && event.detail && (
                    <Badge variant="secondary" className="tabular-nums">
                      {event.detail}
                    </Badge>
                  )}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatAdminDate(event.createdAt)}
                    </p>
                    {event.feedbackId && (
                      <Button
                        asChild
                        variant="link"
                        size="sm"
                        className="h-auto px-0 text-xs text-violet-600 dark:text-violet-400"
                      >
                        <Link
                          href={`/admin/users/${userId}?tab=feedback&feedbackId=${encodeURIComponent(event.feedbackId)}`}
                        >
                          {labels.admin.userProgress.historyViewFeedback}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
