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
  Sparkles,
  TrendingUp,
  UserCircle,
} from "lucide-react";
import { Role } from "@prisma/client";
import { deleteUser } from "@/actions/admin/users";
import {
  USER_SORT_FIELDS,
  type UserListItem,
  type UserSortDir,
  type UserSortField,
  type UserStatusFilter,
} from "@/lib/admin-users";
import type { UserProgressListSummary } from "@/lib/admin-user-progress";
import { formatAdminDateShort } from "@/lib/format-date";
import { getLevelLabel, labels } from "@/lib/labels";
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
import { ListPagination } from "@/components/ui/list-pagination";

type RoleFilter = "ALL" | Role;
type StatusFilter = "ALL" | UserStatusFilter;

type PaginationState = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
};

function formatProgressSummary(summary: UserProgressListSummary): string {
  if (summary.statusLabel === "notStarted") {
    return labels.admin.userProgress.listNotStarted;
  }
  if (summary.statusLabel === "completed") {
    return labels.admin.userProgress.listCompleted;
  }
  if (summary.currentLevelName) {
    return labels.admin.userProgress.listInProgress(
      getLevelLabel(summary.currentLevelName)
    );
  }
  return labels.admin.userProgress.listProgress(
    summary.completedGroups,
    summary.totalGroups
  );
}

const SORT_LABELS: Record<UserSortField, string> = {
  name: labels.admin.sortName,
  email: labels.admin.sortEmail,
  role: labels.admin.sortRole,
  points: labels.admin.sortPoints,
  createdAt: labels.admin.sortCreatedAt,
  isActive: labels.admin.sortIsActive,
};

export function UserList({
  users,
  progressSummaries,
  pagination,
}: {
  users: UserListItem[];
  progressSummaries: Record<number, UserProgressListSummary>;
  pagination: PaginationState;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roleFilter =
    (searchParams.get("role")?.toUpperCase() as RoleFilter) || "ALL";
  const statusParam = searchParams.get("status");
  const statusFilter: StatusFilter =
    statusParam === "active" || statusParam === "inactive"
      ? statusParam
      : "ALL";
  const search = searchParams.get("q") ?? "";
  const sortParam = searchParams.get("sort");
  const sortField = (USER_SORT_FIELDS as readonly string[]).includes(
    sortParam ?? ""
  )
    ? (sortParam as UserSortField)
    : undefined;
  const sortDir: UserSortDir =
    searchParams.get("dir") === "desc" ? "desc" : "asc";

  function pushParams(
    next: Partial<{
      role: RoleFilter;
      status: StatusFilter;
      q: string;
      sort: UserSortField | "";
      dir: UserSortDir;
      page: number;
    }>
  ) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.role !== undefined) {
      if (next.role === "ALL") params.delete("role");
      else params.set("role", next.role);
    }
    if (next.status !== undefined) {
      if (next.status === "ALL") params.delete("status");
      else params.set("status", next.status);
    }
    if (next.q !== undefined) {
      if (!next.q.trim()) params.delete("q");
      else params.set("q", next.q.trim());
    }
    if (next.sort !== undefined) {
      if (!next.sort) params.delete("sort");
      else params.set("sort", next.sort);
    }
    if (next.dir !== undefined) {
      if (next.dir === "asc" && !params.get("sort")) params.delete("dir");
      else if (next.dir === "asc") params.delete("dir");
      else params.set("dir", next.dir);
    }

    const resetsPage =
      next.role !== undefined ||
      next.status !== undefined ||
      next.q !== undefined ||
      next.sort !== undefined ||
      next.dir !== undefined;
    if (next.page !== undefined) {
      if (next.page <= 1) params.delete("page");
      else params.set("page", String(next.page));
    } else if (resetsPage) {
      params.delete("page");
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

  const roleFilters: { id: RoleFilter; label: string }[] = [
    { id: "ALL", label: labels.admin.filterAll },
    { id: Role.STUDENT, label: labels.admin.filterStudents },
    { id: Role.ADMIN, label: labels.admin.filterAdmins },
  ];

  const statusFilters: { id: StatusFilter; label: string }[] = [
    { id: "ALL", label: labels.admin.filterStatusAll },
    { id: "active", label: labels.admin.filterStatusActive },
    { id: "inactive", label: labels.admin.filterStatusInactive },
  ];

  const paginationSearchParams: Record<string, string | undefined> = {
    role: roleFilter === "ALL" ? undefined : roleFilter,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    q: search.trim() || undefined,
    sort: sortField,
    dir: sortField && sortDir === "desc" ? "desc" : undefined,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="surface-elevated flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              defaultValue={search}
              placeholder={labels.admin.searchUsers}
              className="min-h-11 pl-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  pushParams({ q: (e.target as HTMLInputElement).value });
                }
              }}
              onBlur={(e) => pushParams({ q: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="user-sort">
              {labels.admin.sortBy}
            </label>
            <select
              id="user-sort"
              className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-auto"
              value={sortField ?? ""}
              onChange={(e) => {
                const value = e.target.value as UserSortField | "";
                pushParams({
                  sort: value,
                  dir: value ? sortDir : "asc",
                });
              }}
            >
              <option value="">{labels.admin.sortBy}</option>
              {USER_SORT_FIELDS.map((field) => (
                <option key={field} value={field}>
                  {SORT_LABELS[field]}
                </option>
              ))}
            </select>
            <select
              id="user-sort-dir"
              className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-auto"
              value={sortDir}
              disabled={!sortField}
              onChange={(e) =>
                pushParams({ dir: e.target.value as UserSortDir })
              }
            >
              <option value="asc">{labels.admin.sortAsc}</option>
              <option value="desc">{labels.admin.sortDesc}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {roleFilters.map((f) => (
              <Button
                key={f.id}
                type="button"
                size="sm"
                className="min-h-11"
                variant={roleFilter === f.id ? "default" : "outline"}
                onClick={() => pushParams({ role: f.id })}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((f) => (
              <Button
                key={f.id}
                type="button"
                size="sm"
                className="min-h-11"
                variant={statusFilter === f.id ? "default" : "outline"}
                onClick={() => pushParams({ status: f.id })}
              >
                {f.label}
              </Button>
            ))}
          </div>
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
                    <Badge
                      variant={
                        user.role === Role.ADMIN ? "default" : "secondary"
                      }
                    >
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
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{labels.admin.userPoints(user.points)}</span>
                      <span>
                        {labels.admin.userCreatedAt(
                          formatAdminDateShort(user.createdAt.toISOString())
                        )}
                      </span>
                    </span>
                    {user.role === Role.STUDENT &&
                      progressSummaries[user.id] && (
                        <Link
                          href={`/admin/users/${user.id}?tab=progress`}
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <TrendingUp className="size-3.5 shrink-0" />
                          <span>
                            {labels.admin.userProgress.listProgress(
                              progressSummaries[user.id].completedGroups,
                              progressSummaries[user.id].totalGroups
                            )}
                            {" · "}
                            {formatProgressSummary(progressSummaries[user.id])}
                          </span>
                        </Link>
                      )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                  <IconButtonTooltip
                    label={labels.admin.userProgress.tabProgress}
                  >
                    <Button
                      asChild
                      size="icon"
                      variant="outline"
                      aria-label={labels.admin.userProgress.tabProgress}
                      className="size-11"
                    >
                      <Link href={`/admin/users/${user.id}?tab=progress`}>
                        <TrendingUp className="size-4" />
                      </Link>
                    </Button>
                  </IconButtonTooltip>
                  <IconButtonTooltip
                    label={labels.admin.userProgress.tabFeedback}
                  >
                    <Button
                      asChild
                      size="icon"
                      variant="outline"
                      aria-label={labels.admin.userProgress.tabFeedback}
                      className="size-11"
                    >
                      <Link href={`/admin/users/${user.id}?tab=feedback`}>
                        <Sparkles className="size-4" />
                      </Link>
                    </Button>
                  </IconButtonTooltip>
                  <IconButtonTooltip label={labels.common.edit}>
                    <Button
                      asChild
                      size="icon"
                      variant="outline"
                      aria-label={labels.common.edit}
                      className="size-11"
                    >
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

          <ListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={pagination.pageSize}
            pathname="/admin/users"
            searchParams={paginationSearchParams}
          />
        </div>
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
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
