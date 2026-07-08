"use client";

import { LogOut, Trophy } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { BrandMark } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { NavTree } from "@/components/layout/nav-tree";
import { useSidebarRailCollapsed } from "@/components/layout/sidebar-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { studentNavTree } from "@/lib/nav-config";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function StudentNav({
  userName,
  points,
  rankHint,
  proficiencyLabel,
  proficiencyHint,
}: {
  userName: string;
  points: number;
  rankHint?: string;
  proficiencyLabel?: string;
  proficiencyHint?: string;
}) {
  const railCollapsed = useSidebarRailCollapsed();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className={cn(
          "shrink-0 border-b border-sidebar-border",
          railCollapsed ? "p-3" : "p-5"
        )}
      >
        <BrandMark
          subtitle={labels.nav.learning}
          collapsed={railCollapsed}
        />
      </div>

      <div
        className={cn(
          "shrink-0 border-b border-sidebar-border",
          railCollapsed ? "p-2" : "p-4"
        )}
      >
        {railCollapsed ? (
          <div
            className="flex items-center justify-center rounded-md border border-border bg-card p-2"
            title={`${userName} · ${labels.nav.points(points)}${proficiencyLabel ? ` · ${proficiencyLabel}` : ""}`}
          >
            <Trophy className="size-4 text-points" />
          </div>
        ) : (
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-sm">
            <p className="truncate text-sm font-medium">{userName}</p>
            <div className="mt-2 flex items-center gap-2">
              <Trophy className="size-4 text-points" />
              <span className="text-sm font-semibold text-points-foreground">
                {labels.nav.points(points)}
              </span>
            </div>
            {proficiencyLabel && (
              <p className="mt-1 text-[11px] font-medium text-primary">
                {proficiencyLabel}
                {proficiencyHint ? (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {proficiencyHint}
                  </span>
                ) : null}
              </p>
            )}
            {rankHint && (
              <p className="mt-1 text-[11px] text-muted-foreground">{rankHint}</p>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="h-0 min-h-0 flex-1">
        <nav
          className={cn(
            "flex flex-col",
            railCollapsed ? "p-2" : "p-4"
          )}
        >
          {!railCollapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {labels.nav.menu}
            </p>
          )}
          <NavTree items={studentNavTree} />
        </nav>
      </ScrollArea>

      <div
        className={cn(
          "shrink-0 space-y-3 border-t border-sidebar-border",
          railCollapsed ? "p-2" : "p-4"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            railCollapsed ? "flex-col" : "justify-between"
          )}
        >
          {!railCollapsed && (
            <span className="text-xs text-muted-foreground">
              {labels.theme.appearance}
            </span>
          )}
          <ModeToggle />
        </div>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            title={railCollapsed ? labels.auth.signOut : undefined}
            className={cn(
              "gap-2",
              railCollapsed ? "size-9 w-full justify-center p-0" : "w-full justify-start"
            )}
          >
            <LogOut className="size-4" />
            {!railCollapsed && labels.auth.signOut}
          </Button>
        </form>
      </div>
    </div>
  );
}
