import Link from "next/link";
import { getAdminLeaderboard } from "@/actions/admin/ranking";
import { LeaderboardTable } from "@/components/student/ranking/leaderboard-table";
import { RankingPodium } from "@/components/student/ranking/ranking-podium";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { labels } from "@/lib/labels";
import { Crown, Trophy, Users } from "lucide-react";

export default async function AdminRankingPage() {
  const leaderboard = await getAdminLeaderboard();
  const topStudent = leaderboard.entries[0];

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Trophy className="size-7 text-yellow-500" />
            {labels.admin.rankingTitle}
          </span>
        }
        description={labels.admin.rankingDescription}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label={labels.admin.rankedStudents}
          value={leaderboard.totalParticipants}
          icon={Users}
          accent="primary"
        />
        <StatCard
          label={labels.admin.topScore}
          value={topStudent ? topStudent.points : 0}
          icon={Crown}
          accent="points"
        />
      </div>

      <RankingPodium topThree={leaderboard.topThree} />

      <LeaderboardTable
        entries={leaderboard.entries}
        userHref={(userId) => `/admin/users/${userId}`}
      />
    </div>
  );
}
