import Link from "next/link";
import { ArrowRight, Medal, Sparkles, Trophy, Zap } from "lucide-react";
import { LandingLogoStrip } from "@/components/landing/landing-logo-strip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LandingTechBackground } from "@/components/landing/landing-tech-background";
import { RankingTierBadge } from "@/components/student/ranking/ranking-tier-badge";
import { TIERS } from "@/lib/ranking";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

const MOCK_LEARNERS = [
  {
    name: labels.landing.hero.mockLearnerA,
    points: labels.landing.hero.mockPointsA,
    initial: "A",
    rank: 1,
    accent: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  {
    name: labels.landing.hero.mockLearnerB,
    points: labels.landing.hero.mockPointsB,
    initial: "B",
    rank: 2,
    accent: "bg-slate-400/15 text-slate-700 dark:text-slate-300",
  },
  {
    name: labels.landing.hero.mockLearnerC,
    points: labels.landing.hero.mockPointsC,
    initial: "C",
    rank: 3,
    accent: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  },
] as const;

function LandingHeroMock() {
  return (
    <div
      className="landing-reveal landing-reveal-delay-3 relative mx-auto mt-12 w-full max-w-3xl min-w-0 px-0 sm:mt-14"
      role="img"
      aria-label={labels.landing.hero.mockAria}
    >
      <div
        className="landing-float-soft landing-gpu pointer-events-none absolute -left-4 top-6 hidden size-24 rounded-full bg-violet-500/20 blur-2xl sm:block"
        aria-hidden="true"
      />
      <div
        className="landing-float-reverse landing-gpu pointer-events-none absolute -right-6 bottom-4 hidden size-28 rounded-full bg-amber-500/15 blur-2xl sm:block"
        aria-hidden="true"
      />

      <div className="landing-glass landing-gradient-border relative overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5 sm:px-4">
          <span className="size-2.5 rounded-full bg-red-400/80" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-amber-400/80" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" aria-hidden="true" />
          <span className="ml-2 truncate text-xs font-medium text-muted-foreground">
            {labels.landing.hero.mockWindowTitle}
          </span>
        </div>

        <div className="grid gap-3 p-3 sm:grid-cols-5 sm:gap-4 sm:p-4">
          <div className="min-w-0 space-y-2 sm:col-span-3">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Trophy className="size-3.5 text-points" />
                {labels.landing.hero.mockLeaderboardTitle}
              </p>
              <RankingTierBadge tier={TIERS.gold} showOnMobile className="scale-90" />
            </div>

            <ul className="space-y-1.5">
              {MOCK_LEARNERS.map((learner) => (
                <li
                  key={learner.rank}
                  className="flex min-w-0 items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-2.5 py-2 sm:gap-3 sm:px-3"
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      learner.accent
                    )}
                  >
                    {learner.rank}
                  </span>
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                    aria-hidden="true"
                  >
                    {learner.initial}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {learner.name}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-bold tabular-nums text-points">
                      {learner.points}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                      {labels.ranking.pts}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:col-span-2">
            <div className="rounded-xl border border-border/50 bg-background/50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-300">
                  <Sparkles className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {labels.landing.hero.mockQuizTitle}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {labels.landing.hero.mockQuizProgress}
                  </p>
                </div>
              </div>
              <Progress value={72} className="h-2" />
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                {labels.landing.hero.mockQuizPercent}
              </p>
            </div>

            <div className="flex flex-1 items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5">
              <Medal className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {labels.landing.hero.mockTierLabel}
                </p>
                <p className="truncate text-xs text-amber-800/80 dark:text-amber-200/80">
                  {labels.landing.stats.points}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <LandingTechBackground />
      <div
        className="landing-spotlight pointer-events-none absolute inset-x-0 top-0 h-[70%] opacity-90"
        aria-hidden="true"
      />
      <div
        className="landing-aurora landing-gpu pointer-events-none absolute inset-0 opacity-80"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="landing-reveal mb-8 flex justify-center sm:mb-10">
          <LandingLogoStrip priority />
        </div>

        <div className="landing-reveal mx-auto max-w-3xl text-center">
          <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-800 dark:text-violet-200">
            <span className="landing-pulse-ring absolute inset-0 rounded-full border border-violet-500/40" />
            {labels.landing.hero.badge}
          </div>

          <h1 className="landing-gradient-text text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            {labels.landing.hero.title}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {labels.landing.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="landing-cta-glow gap-2 px-8 transition-transform hover:scale-[1.02]"
            >
              <Link href="/login">
                {labels.landing.hero.getStarted}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-11">
              <a href="#features">{labels.landing.hero.exploreFeatures}</a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Trophy className="landing-icon-float size-4 text-points" />
              <span>{labels.login.heroEarnPoints}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap
                className="landing-icon-float size-4 text-primary"
                style={{ animationDelay: "-0.6s" }}
              />
              <span>{labels.login.heroAiFeedback}</span>
            </div>
          </div>
        </div>

        <LandingHeroMock />
      </div>
    </section>
  );
}
