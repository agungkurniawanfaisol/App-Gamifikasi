import { cn } from "@/lib/utils";
import type { TierConfig } from "@/lib/ranking";

export function RankingTierBadge({
  tier,
  className,
  showOnMobile = false,
  compactOnMobile = false,
}: {
  tier: TierConfig;
  className?: string;
  showOnMobile?: boolean;
  compactOnMobile?: boolean;
}) {
  const TierIcon = tier.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        showOnMobile || compactOnMobile
          ? "inline-flex"
          : "hidden sm:inline-flex",
        tier.badgeBg,
        tier.badgeBorder,
        className
      )}
    >
      <TierIcon className={cn("size-3.5", tier.color)} />
      <span
        className={cn(
          "text-xs font-semibold",
          tier.badgeText,
          compactOnMobile && "hidden sm:inline"
        )}
      >
        {tier.label}
      </span>
    </div>
  );
}
