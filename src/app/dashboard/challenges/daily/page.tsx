import Link from "next/link";
import { ArrowLeft, Sun } from "lucide-react";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { getDailyChallengeQuestions } from "@/lib/daily-challenge-service";
import { DailyChallengeFlow } from "@/components/student/challenges/daily-challenge-flow";
import { labels } from "@/lib/labels";

export default async function DailyChallengePage() {
  const session = await requireStudent();
  const userId = getUserId(session);
  const daily = await getDailyChallengeQuestions(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-slide-up">
      <div>
        <Link
          href="/dashboard/challenges"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          {labels.challenges.backToList}
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Sun className="size-7 text-amber-500" />
          {labels.challenges.dailyTitle}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {labels.challenges.dailySubtitle}
        </p>
      </div>

      {daily ? (
        <DailyChallengeFlow
          questions={daily.questions}
          totalCount={daily.totalCount}
          isComplete={daily.isComplete}
          pointReward={daily.pointReward}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          {labels.challenges.dailyUnavailable}
        </div>
      )}
    </div>
  );
}
