"use client";

import Link from "next/link";
import { LogOut, UserCircle } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { UserAvatar } from "@/components/layout/user-avatar";
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

export type HeaderProfileUser = {
  name: string;
  email: string;
  profileImageUrl: string | null;
  profileHref: string;
};

export function UserProfileMenu({ user }: { user: HeaderProfileUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 rounded-full p-0 hover:bg-muted"
          aria-label={user.name}
        >
          <UserAvatar name={user.name} imageUrl={user.profileImageUrl} size="md" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={user.profileHref} className="cursor-pointer gap-2">
            <UserCircle className="size-4" />
            {labels.profile.myProfile}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2 text-destructive"
            >
              <LogOut className="size-4" />
              {labels.auth.signOut}
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
