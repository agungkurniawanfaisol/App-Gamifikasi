import { requireAdmin } from "@/lib/auth-helpers";
import { getMyProfile } from "@/actions/profile";
import { ProfileForm } from "@/components/profile/profile-form";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";
import { UserCircle } from "lucide-react";

export default async function AdminProfilePage() {
  await requireAdmin();
  const profile = await getMyProfile();

  return (
    <div className="animate-slide-up space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <UserCircle className="size-7 text-primary" />
            {labels.profile.title}
          </span>
        }
        description={labels.profile.subtitle}
      />
      <ProfileForm profile={profile} />
    </div>
  );
}
