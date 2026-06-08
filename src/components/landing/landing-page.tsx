import { LandingNav } from "@/components/landing/landing-nav";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingDataStream } from "@/components/landing/landing-tech-background";
import { LandingStats } from "@/components/landing/landing-stats";
import { LandingLeaderboard } from "@/components/landing/landing-leaderboard";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingScrollToTop } from "@/components/landing/landing-scroll-to-top";
import { getPublicLeaderboardPreview } from "@/lib/ranking-queries";

export async function LandingPage() {
  const leaderboard = await getPublicLeaderboardPreview(10);

  return (
    <div className="relative min-h-dvh bg-background">
      <LandingNav />
      <main className="overflow-x-hidden pt-14 md:pt-0">
        <LandingHero />
        <LandingDataStream />
        <LandingStats />
        <LandingLeaderboard leaderboard={leaderboard} />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingCta />
      </main>
      <LandingFooter />
      <LandingScrollToTop />
    </div>
  );
}
