import { getHeaderProfile } from "@/actions/profile";
import { requireStudent } from "@/lib/auth-helpers";
import { labels } from "@/lib/labels";
import { StudentNav } from "@/components/layout/student-nav";
import { AppShell } from "@/components/layout/app-shell";
import { AchievementRewardHost } from "@/components/student/rewards/reward-celebration-host";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth-helpers";
import { getUserRankSummary } from "@/lib/ranking-queries";
import { getProficiencySummary } from "@/lib/proficiency-queries";
import { userChatTodayWhere } from "@/lib/chat-day";
import { mapChatHistoryRows } from "@/lib/chat-message-meta";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStudent();
  const userId = getUserId(session);
  const [user, rankSummary, headerProfile, proficiencySummary, generalChatHistory] =
    await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, points: true },
    }),
    getUserRankSummary(userId),
    getHeaderProfile(),
    getProficiencySummary(userId),
    prisma.chatHistory.findMany({
      where: userChatTodayWhere(userId, null),
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, role: true, message: true, createdAt: true },
    }),
  ]);

  const generalChatMessages = mapChatHistoryRows([...generalChatHistory].reverse());

  return (
    <AppShell
      enableAiRail
      generalChatMessages={generalChatMessages}
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
