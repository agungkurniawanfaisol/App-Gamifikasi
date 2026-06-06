import Link from "next/link";
import { Suspense } from "react";
import { Role } from "@prisma/client";
import { getUsers } from "@/actions/admin/users";
import { UserList } from "@/components/admin/user-list";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";
import { Plus } from "lucide-react";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { role?: string; q?: string };
}) {
  const roleParam = searchParams.role?.toUpperCase();
  const role =
    roleParam === Role.ADMIN || roleParam === Role.STUDENT
      ? roleParam
      : undefined;

  const users = await getUsers({
    role,
    search: searchParams.q,
  });

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
        <UserList users={users} />
      </Suspense>
    </div>
  );
}
