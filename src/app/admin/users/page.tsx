import Link from "next/link";
import { Suspense } from "react";
import { Role } from "@prisma/client";
import {
  getUsersPaginated,
  type UserStatusFilter,
} from "@/actions/admin/users";
import { UserList } from "@/components/admin/user-list";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getUsersProgressSummaries } from "@/lib/admin-user-progress";
import { labels } from "@/lib/labels";
import { Plus } from "lucide-react";

function parseStatus(value?: string): UserStatusFilter | undefined {
  if (value === "active" || value === "inactive") return value;
  return undefined;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    role?: string;
    q?: string;
    status?: string;
    sort?: string;
    dir?: string;
  };
}) {
  const roleParam = searchParams.role?.toUpperCase();
  const role =
    roleParam === Role.ADMIN || roleParam === Role.STUDENT
      ? roleParam
      : undefined;
  const status = parseStatus(searchParams.status);
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const result = await getUsersPaginated({
    page,
    role,
    search: searchParams.q,
    status,
    sort: searchParams.sort,
    dir: searchParams.dir,
  });

  const studentIds = result.items
    .filter((user) => user.role === Role.STUDENT)
    .map((user) => user.id);
  const progressSummaries = Object.fromEntries(
    (await getUsersProgressSummaries(studentIds)).entries()
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={labels.admin.usersTitle}
        description={labels.admin.usersDescription}
      >
        <Button asChild className="gap-2">
          <Link href="/admin/users/new">
            <Plus className="size-4" />
            {labels.admin.addUser}
          </Link>
        </Button>
      </PageHeader>

      <Suspense fallback={<div className="h-24 animate-pulse rounded-xl bg-muted" />}>
        <UserList
          users={result.items}
          progressSummaries={progressSummaries}
          pagination={{
            page: result.page,
            totalPages: result.totalPages,
            total: result.total,
            pageSize: result.pageSize,
          }}
        />
      </Suspense>
    </div>
  );
}
