import Link from "next/link";
import { ChevronRight, Star, Trophy } from "lucide-react";
import { labels } from "@/lib/labels";
import {
  getRankIcon,
  getRowHighlightGradient,
  getTier,
  type LeaderboardEntry,
} from "@/lib/ranking";
import { cn } from "@/lib/utils";
import { RankingTierBadge } from "@/components/student/ranking/ranking-tier-badge";

function LeaderboardRowContent({
  user,
  isCurrentUser,
  tier,
  rankIcon,
  href,
}: {
  user: LeaderboardEntry;
  isCurrentUser: boolean;
  tier: ReturnType<typeof getTier>;
  rankIcon: ReturnType<typeof getRankIcon>;
  href?: string;
}) {
  return (
    <>
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <div className="flex w-10 shrink-0 items-center justify-center pt-0.5 sm:pt-0">
          {rankIcon ? (
            (() => {
              const RankIcon = rankIcon.icon;
              return (
                <RankIcon className={cn("size-5", rankIcon.className)} />
              );
            })()
          ) : (
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                isCurrentUser
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {user.rank}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
              isCurrentUser
                ? "bg-primary/20 text-primary ring-2 ring-primary/30"
                : "bg-muted text-muted-foreground"
            )}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
              <span className="truncate">{user.name}</span>
              {isCurrentUser && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {labels.ranking.you}
                </span>
              )}
            </p>
            {user.institution && (
              <p className="truncate text-xs text-muted-foreground">
                {user.institution}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 pl-[3.25rem] sm:mt-0 sm:pl-0 sm:contents">
        <RankingTierBadge tier={tier} compactOnMobile />

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-bold tabular-nums text-points-foreground">
            {user.points}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {labels.ranking.pts}
          </span>
          {href && (
            <ChevronRight className="size-4 text-muted-foreground/40 transition-opacity group-hover:opacity-100 sm:opacity-0" />
          )}
        </div>
      </div>
    </>
  );
}

export function LeaderboardTable({
  entries,
  currentUserId,
  userHref,
}: {
  entries: LeaderboardEntry[];
  currentUserId?: number;
  userHref?: (userId: number) => string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Star className="size-5 text-primary" />
          {labels.ranking.allParticipants}
        </h2>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Trophy className="mb-4 size-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">{labels.ranking.noParticipants}</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {entries.map((user) => {
            const isCurrentUser =
              currentUserId !== undefined && user.id === currentUserId;
            const tier = getTier(user.points);
            const rankIcon = getRankIcon(user.rank);
            const rowHighlight = getRowHighlightGradient(user.rank);
            const href = userHref?.(user.id);

            const rowClassName = cn(
              "group flex flex-col gap-0 px-4 py-4 transition-all duration-200 sm:flex-row sm:items-center sm:gap-4 sm:px-6",
              href && "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              !href &&
                (isCurrentUser
                  ? "bg-primary/[0.04] hover:bg-primary/[0.07]"
                  : "hover:bg-muted/40")
            );

            const content = (
              <LeaderboardRowContent
                user={user}
                isCurrentUser={isCurrentUser}
                tier={tier}
                rankIcon={rankIcon}
                href={href}
              />
            );

            if (href) {
              return (
                <Link
                  key={user.id}
                  href={href}
                  className={rowClassName}
                  style={
                    rowHighlight
                      ? { backgroundImage: rowHighlight }
                      : undefined
                  }
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={user.id}
                className={rowClassName}
                style={
                  rowHighlight
                    ? { backgroundImage: rowHighlight }
                    : undefined
                }
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
