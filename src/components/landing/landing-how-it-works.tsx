import { GraduationCap, Rocket, Trophy } from "lucide-react";
import { LandingRevealOnScroll } from "@/components/landing/landing-reveal-on-scroll";
import { labels } from "@/lib/labels";

const steps = [
  {
    key: "choose" as const,
    icon: GraduationCap,
    step: "01",
  },
  {
    key: "learn" as const,
    icon: Rocket,
    step: "02",
  },
  {
    key: "earn" as const,
    icon: Trophy,
    step: "03",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-20 overflow-hidden py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 landing-grid-bg opacity-15 dark:opacity-10"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <LandingRevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {labels.landing.steps.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{labels.landing.steps.subtitle}</p>
          </div>
        </LandingRevealOnScroll>

        <div className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          <div
            className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-10 hidden h-px overflow-hidden md:block"
            aria-hidden="true"
          >
            <div
              className="h-full w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              style={{
                backgroundSize: "200% 100%",
                animation: "shimmer 3s linear infinite",
              }}
            />
          </div>

          {steps.map(({ key, icon: Icon, step }, index) => {
            const item = labels.landing.steps.items[key];
            return (
              <LandingRevealOnScroll key={key} delayMs={index * 120}>
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-card shadow-sm transition-shadow hover:shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_15%,transparent)]">
                    <Icon
                      className="landing-icon-float size-7 text-primary"
                      style={{ animationDelay: `${index * 0.5}s` }}
                    />
                    <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-bold text-primary-foreground">
                      {step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </LandingRevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
