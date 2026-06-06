import Link from "next/link";
import { Award, ChevronRight, Gift } from "lucide-react";
import { getRewardsOverview } from "@/actions/student/rewards";
import { labels } from "@/lib/labels";

export async function RewardPreviewCard({ userId }: { userId: number }) {
  void userId;
  const { achievements, certificates } = await getRewardsOverview();
  const earnedCount = achievements.filter((a) => a.unlockedAt).length;
  const next = achievements.find(
    (a) => !a.unlockedAt && a.progress && a.progress.current < a.progress.target
  );

  return (
    <Link
      href="/dashboard/rewards"
      className="group relative block overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
    >
      <div className="absolute -right-4 -top-4 size-16 rounded-full bg-primary/5" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {labels.rewards.previewTitle}
          </p>
          <p className="mt-1 text-lg font-bold">
            {labels.rewards.previewEarned(earnedCount, achievements.length)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {certificates.length > 0
              ? labels.rewards.previewCertificates(certificates.length)
              : next?.progress
                ? labels.rewards.progress(
                    next.progress.current,
                    next.progress.target
                  )
                : labels.rewards.previewEmpty}
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {certificates.length > 0 ? (
            <Award className="size-5" />
          ) : (
            <Gift className="size-5" />
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
        {labels.rewards.viewAll}
        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
