import { requireAdmin, getUserId } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AppShell } from "@/components/layout/app-shell";
import { getCachedShellUser } from "@/lib/cached-queries";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const userId = getUserId(session);

  const user = await getCachedShellUser(userId);
  const headerProfile = user
    ? {
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        profileHref: "/admin/profile",
        role: user.role,
      }
    : undefined;

  return (
    <AppShell
      enableAiRail
      sidebar={<AdminSidebar />}
      headerProfile={headerProfile}
    >
      {children}
    </AppShell>
  );
}
