import Link from "next/link";
import { Role } from "@prisma/client";
import { getAdminDashboardStats } from "@/actions/admin/stats";
import { getActiveAnnouncementsForRole } from "@/lib/announcement-queries";
import { AnnouncementBannerStack } from "@/components/student/announcements/announcement-banner-stack";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { getLevelLabel, labels } from "@/lib/labels";
import { BookOpen, HelpCircle, Layers, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  const [stats, activeAnnouncements] = await Promise.all([
    getAdminDashboardStats(),
    getActiveAnnouncementsForRole(Role.ADMIN, 3),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={labels.admin.dashboardTitle}
        description={labels.admin.dashboardDescription}
      />

      <AnnouncementBannerStack announcements={activeAnnouncements} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/users?role=STUDENT" className="block transition-opacity hover:opacity-90">
          <StatCard
            label={labels.admin.totalStudents}
            value={stats.userCount}
            icon={Users}
            accent="primary"
          />
        </Link>
        <StatCard
          label={labels.admin.totalGroups}
          value={stats.groupCount}
          icon={Layers}
          accent="accent"
        />
        <StatCard
          label={labels.admin.totalQuestions}
          value={stats.questionCount}
          icon={HelpCircle}
          accent="points"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">{labels.admin.manageLevels}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.levels.map((level) => (
            <div
              key={level.id}
              className="surface-card-interactive p-6"
            >
              <h3 className="font-semibold">{getLevelLabel(level.name)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {labels.admin.groupsPublished(
                  level.totalGroups,
                  level.publishedGroups
                )}
              </p>
              <Button asChild className="mt-4 w-full" size="sm">
                <Link href={`/admin/levels/${level.id}/groups`}>
                  {labels.admin.manageContent}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
