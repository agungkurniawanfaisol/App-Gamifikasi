"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import { Role } from "@prisma/client";
import { logoutAction } from "@/actions/auth";
import { UserAvatar } from "@/components/layout/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export type HeaderProfileUser = {
  name: string;
  email: string;
  profileImageUrl: string | null;
  profileHref: string;
  role: Role;
};

function roleLabel(role: Role): string {
  return role === Role.ADMIN
    ? labels.header.roleAdmin
    : labels.header.roleStudent;
}

export function UserProfileMenu({ user }: { user: HeaderProfileUser }) {
  const isAdmin = user.role === Role.ADMIN;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-11 min-h-11 shrink-0 gap-2 rounded-full border-border/80 bg-card/80 py-1 pl-1 pr-2 shadow-sm transition-colors",
            "hover:border-primary/30 hover:bg-accent/50",
            "focus-visible:ring-2 focus-visible:ring-ring",
            "sm:pl-1.5 sm:pr-3"
          )}
          aria-label={`${labels.header.accountMenu}: ${user.name}`}
        >
          <UserAvatar
            name={user.name}
            imageUrl={user.profileImageUrl}
            size="sm"
            variant="header"
          />
          <span className="hidden min-w-0 max-w-[7rem] flex-col items-start text-left leading-tight md:flex">
            <span className="truncate text-sm font-semibold">{user.name}</span>
            <span className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {roleLabel(user.role)}
            </span>
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground max-md:hidden"
            aria-hidden
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="rounded-t-md border-b border-border/60 bg-gradient-to-br from-violet-500/10 via-background to-background p-4">
            <div className="flex items-start gap-3">
              <UserAvatar
                name={user.name}
                imageUrl={user.profileImageUrl}
                size="lg"
                variant="header"
                className="ring-offset-background"
              />
              <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
                <Badge
                  variant={isAdmin ? "default" : "secondary"}
                  className="text-[10px] uppercase tracking-wide"
                >
                  {roleLabel(user.role)}
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <div className="p-1">
          <DropdownMenuItem asChild>
            <Link
              href={user.profileHref}
              className="min-h-11 cursor-pointer gap-2 rounded-md"
            >
              <UserCircle className="size-4" />
              {labels.header.viewProfile}
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link
                href="/admin/settings"
                className="min-h-11 cursor-pointer gap-2 rounded-md"
              >
                <Settings className="size-4" />
                {labels.nav.settings}
              </Link>
            </DropdownMenuItem>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-1">
          <DropdownMenuItem asChild>
            <form action={logoutAction} className="w-full">
              <button
                type="submit"
                className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md text-destructive focus:text-destructive"
              >
                <LogOut className="size-4" />
                {labels.auth.signOut}
              </button>
            </form>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
