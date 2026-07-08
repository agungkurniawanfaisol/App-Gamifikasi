"use client";

import { LogOut, Sparkles } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { NavTree } from "@/components/layout/nav-tree";
import { useSidebarRailCollapsed } from "@/components/layout/sidebar-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminNavTree } from "@/lib/nav-config";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const railCollapsed = useSidebarRailCollapsed();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className={cn(
          "shrink-0 border-b border-sidebar-border",
          railCollapsed ? "p-3" : "p-5"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            railCollapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" />
          </div>
          {!railCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                {labels.nav.brand}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {labels.nav.adminPanel}
              </p>
            </div>
          )}
        </div>
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
          <NavTree items={adminNavTree} />
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
