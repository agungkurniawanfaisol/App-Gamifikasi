import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { getActiveChallengesForUser } from "@/lib/challenge-queries";
import { ChallengeCard } from "@/components/student/challenges/challenge-card";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";
import { Target } from "lucide-react";

export default async function ChallengesPage() {
  const session = await requireStudent();
  const userId = getUserId(session);
  const challenges = await getActiveChallengesForUser(userId);

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title={
          <span className="flex items-center gap-2 sm:gap-3">
            <Target className="size-6 shrink-0 text-amber-600 dark:text-amber-400 sm:size-7" />
            {labels.challenges.pageTitle}
          </span>
        }
        description={labels.challenges.pageSubtitle}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.slug} challenge={challenge} />
        ))}
      </div>

      {challenges.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          {labels.challenges.empty}
        </div>
      )}
    </div>
  );
}
