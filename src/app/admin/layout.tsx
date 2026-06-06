import { getHeaderProfile } from "@/actions/profile";
import { requireAdmin } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AppShell } from "@/components/layout/app-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const headerProfile = await getHeaderProfile();

  return (
    <AppShell sidebar={<AdminSidebar />} headerProfile={headerProfile}>
      {children}
    </AppShell>
  );
}
