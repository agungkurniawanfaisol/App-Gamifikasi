import { Crown, Lock } from "lucide-react";
import { getLevelLabel } from "@/lib/labels";
import { labels } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";

type UnlockSummary = Awaited<
  ReturnType<typeof import("@/lib/premium-access").getPremiumUnlockSummaries>
>[number];

export function UnlocksPanel({ unlocks }: { unlocks: UnlockSummary[] }) {
  return (
    <div className="space-y-4">
      {unlocks.map((entry) => (
        <div
          key={entry.level.id}
          className="rounded-xl border border-border/70 bg-card p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                {entry.unlocked ? (
                  <Crown className="size-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Lock className="size-5 text-muted-foreground" />
                )}
                <h3 className="font-semibold">
                  {getLevelLabel(entry.level.name)}
                </h3>
                <Badge variant={entry.unlocked ? "default" : "secondary"}>
                  {entry.unlocked
                    ? labels.rewards.unlocked
                    : labels.rewards.locked}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {entry.unlocked
                  ? labels.rewards.premiumGroupsUnlocked(entry.premiumGroups.length)
                  : labels.rewards.premiumGroupsLocked(entry.premiumGroups.length)}
              </p>
              {entry.achievementTitle && !entry.unlocked && (
                <p className="mt-1 text-xs text-primary">
                  {labels.rewards.requirementHint(
                    entry.requirementTitle ?? entry.achievementTitle
                  )}
                </p>
              )}
            </div>
          </div>

          {entry.premiumGroups.length > 0 && (
            <ul className="mt-4 space-y-2">
              {entry.premiumGroups.map((group) => (
                <li
                  key={group.id}
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm"
                >
                  <span>{group.title}</span>
                  <Badge variant="outline" className="text-[10px]">
                    Premium
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
