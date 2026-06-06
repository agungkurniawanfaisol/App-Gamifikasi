import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { getBadgePreviewSummary } from "@/actions/student/badges";
import { labels } from "@/lib/labels";

export async function BadgePreviewCard({ userId }: { userId: number }) {
  const summary = await getBadgePreviewSummary(userId);

  return (
    <Link
      href="/dashboard/badges"
      className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Award className="size-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {labels.badges.badgePreview}
        </p>
        <p className="font-semibold text-foreground">
          {labels.badges.earnedCount(summary.earnedCount, summary.totalCount)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {summary.nextUnlock
            ? labels.badges.nextBadgeHint(summary.nextUnlock.label)
            : summary.earnedCount >= summary.totalCount
              ? labels.badges.allEarned
              : labels.badges.noBadges}
        </p>
      </div>
      <div className="hidden items-center gap-1 text-xs font-medium text-primary sm:flex">
        {labels.badges.viewAllBadges}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
