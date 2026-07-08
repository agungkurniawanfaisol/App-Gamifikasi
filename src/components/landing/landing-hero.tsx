import Link from "next/link";
import { ArrowRight, Trophy, Zap } from "lucide-react";
import { BrandLogoPair } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { LandingTechBackground } from "@/components/landing/landing-tech-background";
import { labels } from "@/lib/labels";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <LandingTechBackground />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="landing-reveal mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center sm:mb-10">
            <BrandLogoPair
              size="2xl"
              priority
              className="gap-4 sm:gap-6 md:gap-8 [&_img]:!size-28 sm:[&_img]:!size-36 md:[&_img]:!size-44 lg:[&_img]:!size-52"
            />
          </div>

          <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <span className="landing-pulse-ring absolute inset-0 rounded-full border border-violet-500/35" />
            {labels.landing.hero.badge}
          </div>

          <h1 className="landing-gradient-text text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {labels.landing.hero.title}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {labels.landing.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="gap-2 px-8 transition-transform hover:scale-[1.02]"
            >
              <Link href="/login">
                {labels.landing.hero.getStarted}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
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
      </div>
    </section>
  );
}
