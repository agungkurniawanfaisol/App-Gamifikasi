"use client";

import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import type { AdminLevelProgressClient } from "@/lib/admin-user-progress";
import { getLevelLabel, labels } from "@/lib/labels";
import { GroupProgressCard } from "@/components/admin/user-progress/group-progress-card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

function LevelSection({
  level,
  userId,
}: {
  level: AdminLevelProgressClient;
  userId: number;
}) {
  const [open, setOpen] = useState(level.completed < level.total);

  if (level.groups.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/30">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold">{getLevelLabel(level.levelName)}</p>
              <p className="text-xs text-muted-foreground">
                {labels.admin.userProgress.groupsInLevel(level.completed, level.total)}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 border-t border-border px-4 py-4">
            {level.groups.map((group) => (
              <GroupProgressCard
                key={group.group.id}
                group={group}
                userId={userId}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function UserLevelProgressAccordion({
  levels,
  userId,
}: {
  levels: AdminLevelProgressClient[];
  userId: number;
}) {
  const hasGroups = levels.some((level) => level.groups.length > 0);

  if (!hasGroups) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {labels.admin.userProgress.emptyNotStarted}
      </p>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {labels.admin.userProgress.levelProgressTitle}
      </h3>
      <div className="space-y-3">
        {levels.map((level) => (
          <LevelSection key={level.levelId} level={level} userId={userId} />
        ))}
      </div>
    </section>
  );
}
