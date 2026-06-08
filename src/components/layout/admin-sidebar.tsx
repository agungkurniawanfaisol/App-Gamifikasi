"use client";

import {
  BarChart3,
  BookOpen,
  Key,
  LayoutDashboard,
  Layers,
  LogOut,
  Megaphone,
  MessageSquare,
  MessageSquareQuote,
  Settings,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { NavLink } from "@/components/layout/nav-link";
import { useSidebar } from "@/components/layout/sidebar-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/admin/dashboard",
    label: labels.nav.dashboard,
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/admin/analytics", label: labels.nav.analytics, icon: BarChart3 },
  { href: "/admin/levels", label: labels.nav.levels, icon: Layers },
  { href: "/admin/users", label: labels.nav.users, icon: Users },
  {
    href: "/admin/gamification",
    label: labels.nav.gamification,
    icon: Sparkles,
  },
  {
    href: "/admin/announcements",
    label: labels.nav.announcements,
    icon: Megaphone,
  },
  { href: "/admin/chat", label: labels.nav.chatMonitor, icon: MessageSquare },
  {
    href: "/admin/testimonials",
    label: labels.nav.testimonials,
    icon: MessageSquareQuote,
  },
  { href: "/admin/ranking", label: labels.nav.ranking, icon: Trophy },
  { href: "/admin/settings", label: labels.nav.settings, icon: Settings },
  { href: "/admin/api-tokens", label: labels.nav.apiTokens, icon: Key },
  {
    href: "/admin/assistant-knowledge",
    label: labels.nav.assistantKnowledge,
    icon: BookOpen,
  },
];

export function AdminSidebar() {
  const { collapsed } = useSidebar();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className={cn(
          "shrink-0 border-b border-sidebar-border",
          collapsed ? "p-3" : "p-5"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" />
          </div>
          {!collapsed && (
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
            "flex flex-col gap-1",
            collapsed ? "p-2" : "p-4"
          )}
        >
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {labels.nav.menu}
            </p>
          )}
          {links.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
      </ScrollArea>

      <div
        className={cn(
          "shrink-0 space-y-3 border-t border-sidebar-border",
          collapsed ? "p-2" : "p-4"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed ? "flex-col" : "justify-between"
          )}
        >
          {!collapsed && (
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
            title={collapsed ? labels.auth.signOut : undefined}
            className={cn(
              "gap-2",
              collapsed ? "size-9 w-full justify-center p-0" : "w-full justify-start"
            )}
          >
            <LogOut className="size-4" />
            {!collapsed && labels.auth.signOut}
          </Button>
        </form>
      </div>
    </div>
  );
}
