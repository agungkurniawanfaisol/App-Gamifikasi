import { UserForm } from "@/components/admin/user-form";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";

export default function NewUserPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={labels.admin.addUser} />
      <UserForm />
    </div>
  );
}
