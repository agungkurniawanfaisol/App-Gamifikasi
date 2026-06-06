import Link from "next/link";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { getGlobalLeaderboard } from "@/lib/ranking-queries";
import { labels } from "@/lib/labels";
import { LeaderboardTable } from "@/components/student/ranking/leaderboard-table";
import { RankingHero } from "@/components/student/ranking/ranking-hero";
import { RankingPodium } from "@/components/student/ranking/ranking-podium";
import { PageHeader } from "@/components/ui/page-header";
import { Trophy } from "lucide-react";

export default async function RankingPage() {
  const session = await requireStudent();
  const userId = getUserId(session);
  const leaderboard = await getGlobalLeaderboard(userId);

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Trophy className="size-7 text-yellow-500" />
            {labels.ranking.title}
          </span>
        }
        description={labels.ranking.subtitle}
      />

      <RankingHero
        currentUser={leaderboard.currentUser}
        currentUserRank={leaderboard.currentUserRank}
        totalParticipants={leaderboard.totalParticipants}
      />

      <RankingPodium topThree={leaderboard.topThree} />

      <LeaderboardTable entries={leaderboard.entries} currentUserId={userId} />
    </div>
  );
}
