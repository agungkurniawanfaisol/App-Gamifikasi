"use client";

import {
  Award,
  BookOpen,
  Gift,
  Home,
  LogOut,
  MessageCircle,
  Trophy,
  Medal,
  Target,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { BrandMark } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { NavLink } from "@/components/layout/nav-link";
import { useSidebar } from "@/components/layout/sidebar-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/dashboard",
    label: labels.nav.home,
    icon: Home,
    exact: true,
  },
  { href: "/dashboard/learn", label: labels.nav.learn, icon: BookOpen },
  { href: "/dashboard/chat", label: labels.nav.chat, icon: MessageCircle },
  {
    href: "/dashboard/ranking",
    label: labels.nav.ranking,
    icon: Medal,
  },
  {
    href: "/dashboard/badges",
    label: labels.nav.badges,
    icon: Award,
  },
  {
    href: "/dashboard/rewards",
    label: labels.nav.rewards,
    icon: Gift,
  },
  {
    href: "/dashboard/challenges",
    label: labels.nav.challenges,
    icon: Target,
  },
];

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
  const { collapsed } = useSidebar();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className={cn(
          "shrink-0 border-b border-sidebar-border",
          collapsed ? "p-3" : "p-5"
        )}
      >
        <BrandMark
          subtitle={labels.nav.learning}
          collapsed={collapsed}
        />
      </div>

      <div
        className={cn(
          "shrink-0 border-b border-sidebar-border",
          collapsed ? "p-2" : "p-4"
        )}
      >
        {collapsed ? (
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
