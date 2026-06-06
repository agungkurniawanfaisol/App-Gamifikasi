"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Mail,
  Pencil,
  Phone,
  School,
  Search,
  Trash2,
  UserCircle,
} from "lucide-react";
import { Role } from "@prisma/client";
import { deleteUser, type UserListItem } from "@/actions/admin/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButtonTooltip } from "@/components/ui/icon-button-tooltip";
import { Input } from "@/components/ui/input";
import { labels } from "@/lib/labels";

type RoleFilter = "ALL" | Role;

export function UserList({ users }: { users: UserListItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roleFilter = (searchParams.get("role")?.toUpperCase() as RoleFilter) || "ALL";
  const search = searchParams.get("q") ?? "";

  function setFilters(next: { role?: RoleFilter; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.role !== undefined) {
      if (next.role === "ALL") params.delete("role");
      else params.set("role", next.role);
    }
    if (next.q !== undefined) {
      if (!next.q.trim()) params.delete("q");
      else params.set("q", next.q.trim());
    }
    const qs = params.toString();
    router.push(qs ? `/admin/users?${qs}` : "/admin/users");
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteUser(deleteTarget.id);
        setDeleteTarget(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete user.");
      }
    });
  }

  const filters: { id: RoleFilter; label: string }[] = [
    { id: "ALL", label: labels.admin.filterAll },
    { id: Role.STUDENT, label: labels.admin.filterStudents },
    { id: Role.ADMIN, label: labels.admin.filterAdmins },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="surface-elevated flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={search}
            placeholder={labels.admin.searchUsers}
            className="h-10 pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFilters({ q: (e.target as HTMLInputElement).value });
              }
            }}
            onBlur={(e) => setFilters({ q: e.target.value })}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.id}
              type="button"
              size="sm"
              variant={roleFilter === f.id ? "default" : "outline"}
              onClick={() => setFilters({ role: f.id })}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {users.length === 0 ? (
        <EmptyState icon={UserCircle} title={labels.admin.noUsersYet} />
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div key={user.id} className="surface-card overflow-hidden">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold">{user.name}</h3>
                    <Badge variant={user.role === Role.ADMIN ? "default" : "secondary"}>
                      {user.role === Role.ADMIN
                        ? labels.admin.filterAdmins
                        : labels.admin.filterStudents}
                    </Badge>
                    <Badge variant={user.isActive ? "outline" : "destructive"}>
                      {user.isActive
                        ? labels.admin.userActive
                        : labels.admin.userInactive}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2 truncate">
                      <Mail className="size-3.5 shrink-0" />
                      {user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-2">
                        <Phone className="size-3.5 shrink-0" />
                        {user.phone}
                      </span>
                    )}
                    {user.institution && (
                      <span className="flex items-center gap-2 truncate">
                        <School className="size-3.5 shrink-0" />
                        {user.institution}
                        {user.studentId ? ` · ${user.studentId}` : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                  <IconButtonTooltip label={labels.common.edit}>
                    <Button asChild size="icon" variant="outline" aria-label={labels.common.edit} className="size-11">
                      <Link href={`/admin/users/${user.id}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                  </IconButtonTooltip>
                  <IconButtonTooltip label={labels.common.delete}>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      disabled={pending}
                      aria-label={labels.common.delete}
                      className="size-11"
                      onClick={() => setDeleteTarget(user)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </IconButtonTooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.admin.deleteUserTitle}</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? labels.admin.deleteUserDescription(deleteTarget.name)
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              {labels.common.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={confirmDelete}
            >
              {labels.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
