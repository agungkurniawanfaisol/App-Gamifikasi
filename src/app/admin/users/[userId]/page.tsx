import { notFound } from "next/navigation";
import { getUserById } from "@/actions/admin/users";
import { UserForm } from "@/components/admin/user-form";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default async function EditUserPage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = parseInt(params.userId, 10);
  if (Number.isNaN(userId)) notFound();

  const user = await getUserById(userId);
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={labels.admin.editUser}
        description={user.email}
      />
      <UserForm user={user} />
    </div>
  );
}
