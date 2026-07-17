import { Brain, Layers, Trophy } from "lucide-react";
import { LandingRevealOnScroll } from "@/components/landing/landing-reveal-on-scroll";
import { labels } from "@/lib/labels";

const stats = [
  { icon: Trophy, label: labels.landing.stats.points },
  { icon: Brain, label: labels.landing.stats.ai },
  { icon: Layers, label: labels.landing.stats.skills },
];

export function LandingStats() {
  return (
    <section className="border-y border-border/60 bg-card/60 py-10 dark:bg-card/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <LandingRevealOnScroll>
          <p className="mb-6 text-center font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {labels.landing.stats.label}
          </p>
        </LandingRevealOnScroll>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          {stats.map(({ icon: Icon, label }, index) => (
            <LandingRevealOnScroll key={label} delayMs={index * 100}>
              <div className="landing-glass landing-card-tech flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 sm:min-w-[180px]">
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 shadow-[0_0_16px_color-mix(in_srgb,var(--primary)_18%,transparent)]">
                  <Icon
                    className="landing-icon-float size-5 text-primary"
                    style={{ animationDelay: `${index * 0.35}s` }}
                  />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            </LandingRevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
