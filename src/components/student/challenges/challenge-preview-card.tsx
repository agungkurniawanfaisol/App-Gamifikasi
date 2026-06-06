import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { getChallengePreviewSummary } from "@/lib/challenge-queries";
import { labels } from "@/lib/labels";

export async function ChallengePreviewCard({ userId }: { userId: number }) {
  const summary = await getChallengePreviewSummary(userId);

  return (
    <Link
      href="/dashboard/challenges"
      className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
        <Target className="size-5 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {labels.challenges.previewTitle}
        </p>
        <p className="font-semibold text-foreground">
          {labels.challenges.completedCount(
            summary.completedCount,
            summary.totalCount
          )}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {summary.nextChallenge
            ? labels.challenges.nextHint(
                summary.nextChallenge.title,
                summary.nextChallenge.progressPercent
              )
            : labels.challenges.allComplete}
        </p>
      </div>
      <div className="hidden items-center gap-1 text-xs font-medium text-primary sm:flex">
        {labels.challenges.viewAll}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
