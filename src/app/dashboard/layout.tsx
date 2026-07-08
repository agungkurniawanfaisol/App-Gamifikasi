import { requireStudent } from "@/lib/auth-helpers";
import { labels } from "@/lib/labels";
import { StudentNav } from "@/components/layout/student-nav";
import { AppShell } from "@/components/layout/app-shell";
import { AchievementRewardHost } from "@/components/student/rewards/reward-celebration-host";
import { getUserId } from "@/lib/auth-helpers";
import {
  getCachedProficiencySummary,
  getCachedShellUser,
  getCachedUserRankSummary,
} from "@/lib/cached-queries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStudent();
  const userId = getUserId(session);
  const [user, rankSummary, proficiencySummary] =
    await Promise.all([
    getCachedShellUser(userId),
    getCachedUserRankSummary(userId),
    getCachedProficiencySummary(userId),
  ]);
  const headerProfile = user
    ? {
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        profileHref: "/dashboard/profile",
        role: user.role,
      }
    : undefined;

  return (
    <AppShell
      enableAiRail
      headerProfile={headerProfile}
      sidebar={
        <StudentNav
          userName={user?.name ?? session.user.name ?? labels.nav.defaultStudent}
          points={user?.points ?? 0}
          rankHint={
            rankSummary
              ? labels.ranking.rankSummary(rankSummary.rank, rankSummary.tier.label)
              : undefined
          }
          proficiencyLabel={proficiencySummary.level.label}
          proficiencyHint={labels.proficiency.score(proficiencySummary.score)}
        />
      }
    >
      <AchievementRewardHost userId={userId} />
      {children}
    </AppShell>
  );
}
