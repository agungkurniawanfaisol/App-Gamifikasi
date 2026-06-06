import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "primary" | "accent" | "points";
}) {
  const accentStyles = {
    primary: "bg-accent text-accent-foreground",
    accent: "bg-muted text-foreground",
    points: "bg-accent text-points-foreground",
  };

  return (
    <div className="surface-card-featured relative overflow-hidden p-6">
      <div className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />
      <div className="flex items-start justify-between pl-2">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-4xl font-bold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-lg",
            accentStyles[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
