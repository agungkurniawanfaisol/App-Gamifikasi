import Link from "next/link";
import { ArrowRight, Crown, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RankingPodium } from "@/components/student/ranking/ranking-podium";
import { RankingTierBadge } from "@/components/student/ranking/ranking-tier-badge";
import { LandingRevealOnScroll } from "@/components/landing/landing-reveal-on-scroll";
import {
  getRankIcon,
  getTier,
  TIERS,
  type LeaderboardEntry,
  type LeaderboardResult,
} from "@/lib/ranking";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

function LandingLeaderboardRow({
  user,
  delayMs,
}: {
  user: LeaderboardEntry;
  delayMs: number;
}) {
  const tier = getTier(user.points);
  const rankIcon = getRankIcon(user.rank);

  return (
    <LandingRevealOnScroll delayMs={delayMs}>
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card hover:shadow-md">
        <div className="flex w-8 shrink-0 items-center justify-center">
          {rankIcon ? (
            (() => {
              const RankIcon = rankIcon.icon;
              return <RankIcon className={cn("size-4", rankIcon.className)} />;
            })()
          ) : (
            <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {user.rank}
            </span>
          )}
        </div>

        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          {user.institution && (
            <p className="truncate text-xs text-muted-foreground">{user.institution}</p>
          )}
        </div>

        <div className="hidden shrink-0 sm:block">
          <RankingTierBadge tier={tier} showOnMobile />
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-bold tabular-nums text-points">{user.points}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {labels.ranking.pts}
          </p>
        </div>
      </div>
    </LandingRevealOnScroll>
  );
}

export function LandingLeaderboard({ leaderboard }: { leaderboard: LeaderboardResult }) {
  const rest = leaderboard.entries.filter((entry) => entry.rank > 3);
  const hasParticipants = leaderboard.totalParticipants > 0;

  return (
    <section
      id="leaderboard"
      className="relative scroll-mt-20 overflow-hidden border-y border-border/60 py-16 sm:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,hsl(var(--primary)/0.12),transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 landing-grid-bg opacity-15 dark:opacity-10"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <LandingRevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <Trophy className="landing-icon-float size-3.5" />
              {labels.landing.leaderboard.title}
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {labels.ranking.podium}
            </h2>
            <p className="mt-3 text-muted-foreground">{labels.landing.leaderboard.subtitle}</p>
            {hasParticipants && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <Users className="size-3.5 text-primary" />
                {labels.landing.leaderboard.participants(leaderboard.totalParticipants)}
              </p>
            )}
          </div>
        </LandingRevealOnScroll>

        {hasParticipants ? (
          <div className="mt-10 space-y-8">
            <LandingRevealOnScroll delayMs={100}>
              <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-lg backdrop-blur-sm">
                <RankingPodium topThree={leaderboard.topThree} />
              </div>
            </LandingRevealOnScroll>

            {rest.length > 0 && (
              <div>
                <LandingRevealOnScroll delayMs={150}>
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <Crown className="size-4 text-primary" />
                    {labels.landing.leaderboard.topTen}
                  </h3>
                </LandingRevealOnScroll>
                <div className="space-y-2">
                  {rest.map((user, index) => (
                    <LandingLeaderboardRow
                      key={user.id}
                      user={user}
                      delayMs={index * 60}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <LandingRevealOnScroll delayMs={100}>
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-500/10">
                <Trophy className="size-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{labels.landing.leaderboard.emptyTitle}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {labels.landing.leaderboard.emptySubtitle}
              </p>
            </div>
          </LandingRevealOnScroll>
        )}

        <LandingRevealOnScroll delayMs={100}>
          <div className="mt-10">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {labels.landing.leaderboard.tiersTitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.values(TIERS).map((tier) => (
                <RankingTierBadge key={tier.name} tier={tier} showOnMobile />
              ))}
            </div>
          </div>
        </LandingRevealOnScroll>

        <LandingRevealOnScroll delayMs={150}>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="gap-2 px-8">
              <Link href="/login">
                {labels.landing.leaderboard.joinCta}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </LandingRevealOnScroll>
      </div>
    </section>
  );
}
