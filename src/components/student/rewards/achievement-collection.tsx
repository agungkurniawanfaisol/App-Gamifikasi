import {
  Award,
  BookOpen,
  Flame,
  Footprints,
  GraduationCap,
  Languages,
  Lock,
  Rocket,
  Target,
  Trophy,
} from "lucide-react";
import type { AchievementWithProgress } from "@/lib/achievement-engine";
import { labels } from "@/lib/labels";
import { Progress } from "@/components/ui/progress";

const ICONS: Record<string, typeof Trophy> = {
  trophy: Trophy,
  target: Target,
  flame: Flame,
  footprints: Footprints,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  languages: Languages,
  rocket: Rocket,
};

export function AchievementCollection({
  achievements,
}: {
  achievements: AchievementWithProgress[];
}) {
  const earned = achievements.filter((a) => a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);

  return (
    <div className="space-y-8">
      {earned.length > 0 && (
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {labels.rewards.sectionEarned}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {earned.map((achievement) => {
              const Icon = ICONS[achievement.iconKey] ?? Trophy;
              return (
                <div
                  key={achievement.slug}
                  className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-4"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{achievement.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {labels.rewards.sectionLocked}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {locked.map((achievement) => {
              const Icon = ICONS[achievement.iconKey] ?? Lock;
              return (
                <div
                  key={achievement.slug}
                  className="rounded-xl border border-border/70 bg-muted/15 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{achievement.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                      {achievement.progress && (
                        <div className="mt-3 space-y-1.5">
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>
                              {labels.rewards.progress(
                                achievement.progress.current,
                                achievement.progress.target
                              )}
                            </span>
                            <span>{achievement.progress.percent}%</span>
                          </div>
                          <Progress
                            value={achievement.progress.percent}
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
