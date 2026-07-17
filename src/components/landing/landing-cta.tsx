import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingRevealOnScroll } from "@/components/landing/landing-reveal-on-scroll";
import { labels } from "@/lib/labels";

export function LandingCta() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <LandingRevealOnScroll>
          <div className="landing-cta-shimmer landing-glass landing-gradient-border relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              className="landing-float landing-gpu pointer-events-none absolute -right-8 -top-8 size-44 rounded-full bg-violet-500/20 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="landing-float-reverse landing-float-delay-2 landing-gpu pointer-events-none absolute -bottom-10 -left-10 size-36 rounded-full bg-primary/15 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="landing-spotlight pointer-events-none absolute inset-0 opacity-60"
              aria-hidden="true"
            />
            <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
              {labels.landing.cta.title}
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-muted-foreground">
              {labels.landing.cta.subtitle}
            </p>
            <Button
              asChild
              size="lg"
              className="landing-cta-glow relative mt-8 gap-2 px-8 transition-transform hover:scale-[1.02]"
            >
              <Link href="/login">
                {labels.landing.cta.button}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </LandingRevealOnScroll>
      </div>
    </section>
  );
}
