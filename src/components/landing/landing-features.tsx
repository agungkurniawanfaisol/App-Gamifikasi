import {
  Award,
  BookOpen,
  Gift,
  Medal,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingRevealOnScroll } from "@/components/landing/landing-reveal-on-scroll";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

const featureConfig: {
  key: keyof typeof labels.landing.features.items;
  icon: LucideIcon;
  accent: string;
}[] = [
  {
    key: "learning",
    icon: BookOpen,
    accent: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "ai",
    icon: Sparkles,
    accent: "from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400",
  },
  {
    key: "ranking",
    icon: Medal,
    accent: "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400",
  },
  {
    key: "badges",
    icon: Award,
    accent: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
  },
  {
    key: "rewards",
    icon: Gift,
    accent: "from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400",
  },
  {
    key: "challenges",
    icon: Target,
    accent: "from-cyan-500/20 to-cyan-500/5 text-cyan-600 dark:text-cyan-400",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border/60 bg-muted/40 py-16 sm:py-20 dark:bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <LandingRevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {labels.landing.features.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{labels.landing.features.subtitle}</p>
          </div>
        </LandingRevealOnScroll>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureConfig.map(({ key, icon: Icon, accent }, index) => {
            const item = labels.landing.features.items[key];
            return (
              <LandingRevealOnScroll key={key} delayMs={index * 80}>
                <Card className="landing-card-tech landing-glass landing-gradient-border h-full border-transparent shadow-sm">
                  <CardHeader className="pb-3">
                    <div
                      className={cn(
                        "mb-2 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
                        accent
                      )}
                    >
                      <Icon
                        className="landing-icon-float size-5"
                        style={{ animationDelay: `${index * 0.35}s` }}
                      />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </LandingRevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
