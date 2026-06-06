import Link from "next/link";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import { getUserRankSummary } from "@/lib/ranking-queries";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export async function RankingPreviewCard({ userId }: { userId: number }) {
  const summary = await getUserRankSummary(userId);
  if (!summary || summary.totalParticipants === 0) return null;

  const TierIcon = summary.tier.icon;

  return (
    <Link
      href="/dashboard/ranking"
      className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          summary.tier.badgeBg
        )}
      >
        <TierIcon className={cn("size-5", summary.tier.color)} />
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {labels.ranking.rankPreview}
        </p>
        <p className="font-semibold text-foreground">
          {labels.ranking.rankOf(summary.rank, summary.totalParticipants)}
        </p>
        <p className="text-xs text-muted-foreground">
          {summary.tier.label} · {labels.ranking.points(summary.points)}
        </p>
      </div>
      <div className="hidden items-center gap-1 text-xs font-medium text-primary sm:flex">
        {labels.ranking.viewLeaderboard}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
      <Trophy className="size-4 text-points sm:hidden" />
    </Link>
  );
}

export async function SidebarRankHint({ userId }: { userId: number }) {
  const summary = await getUserRankSummary(userId);
  if (!summary || summary.rank <= 0) return null;

  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
      <Sparkles className="size-3 text-points" />
      {labels.ranking.rankSummary(summary.rank, summary.tier.label)}
    </p>
  );
}
