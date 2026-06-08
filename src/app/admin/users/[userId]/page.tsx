import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { getUserById } from "@/actions/admin/users";
import { UserDetailTabs } from "@/components/admin/user-progress/user-detail-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminUserProgressOverview } from "@/lib/admin-user-progress";
import { labels } from "@/lib/labels";
import { ArrowLeft } from "lucide-react";

export default async function EditUserPage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = parseInt(params.userId, 10);
  if (Number.isNaN(userId)) notFound();

  const user = await getUserById(userId);
  if (!user) notFound();

  const progressOverview =
    user.role === Role.STUDENT
      ? await getAdminUserProgressOverview(userId)
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={user.name} description={user.email}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={user.role === Role.ADMIN ? "default" : "secondary"}>
            {user.role === Role.ADMIN
              ? labels.admin.filterAdmins
              : labels.admin.filterStudents}
          </Badge>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/admin/users">
              <ArrowLeft className="size-4" />
              {labels.common.back}
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}
      >
        <UserDetailTabs user={user} progressOverview={progressOverview} />
      </Suspense>
    </div>
  );
}
