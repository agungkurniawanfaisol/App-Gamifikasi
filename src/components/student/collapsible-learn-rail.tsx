"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CollapsibleLearnRailProps = {
  side: "left" | "right";
  collapsed: boolean;
  onToggle: () => void;
  collapsedIcon: LucideIcon;
  collapsedTooltip: string;
  toggleExpandLabel: string;
  toggleCollapseLabel: string;
  panelClassName?: string;
  expandedWidthClass?: string;
  collapsedWidthClass?: string;
  hideChildrenWhenCollapsed?: boolean;
  useCollapsedCard?: boolean;
  className?: string;
  desktopBreakpoint?: "md" | "lg";
  children: React.ReactNode;
};

export function CollapsibleLearnRail({
  side,
  collapsed,
  onToggle,
  collapsedIcon: CollapsedIcon,
  collapsedTooltip,
  toggleExpandLabel,
  toggleCollapseLabel,
  panelClassName,
  expandedWidthClass = "w-72 lg:w-80 xl:w-[22rem]",
  collapsedWidthClass = "w-16",
  hideChildrenWhenCollapsed = false,
  useCollapsedCard = false,
  className,
  desktopBreakpoint = "md",
  children,
}: CollapsibleLearnRailProps) {
  const isLeft = side === "left";
  const CollapsedToggleIcon = collapsed
    ? isLeft
      ? ChevronRight
      : ChevronLeft
    : isLeft
      ? ChevronLeft
      : ChevronRight;

  const collapsedIconButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex size-10 items-center justify-center rounded-lg transition-colors",
            isLeft
              ? "bg-primary/10 text-primary hover:bg-primary/15"
              : "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 dark:text-violet-400"
          )}
          aria-label={toggleExpandLabel}
        >
          <CollapsedIcon className="size-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={isLeft ? "right" : "left"}>
        {collapsedTooltip}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <aside
      className={cn(
        "relative hidden shrink-0 transition-[width] duration-200 ease-in-out",
        desktopBreakpoint === "lg" ? "lg:block" : "md:block",
        collapsed
          ? cn("self-start", collapsedWidthClass)
          : cn("h-full min-h-0 max-h-full self-stretch", expandedWidthClass),
        className
      )}
    >
      {collapsed ? (
        hideChildrenWhenCollapsed ? (
          <div className="flex w-full justify-center py-1">{collapsedIconButton}</div>
        ) : useCollapsedCard ? (
          <div
            className={cn(
              "flex h-[calc(100dvh-9rem)] max-h-[calc(100dvh-9rem)] w-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm",
              panelClassName
            )}
          >
            {children}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-2 py-1">
            {collapsedIconButton}
            <div className="flex max-h-[calc(100vh-10rem)] w-full flex-col items-center gap-1.5 overflow-y-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {children}
            </div>
          </div>
        )
      ) : (
        <div
          className={cn(
            "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm",
            panelClassName
          )}
        >
          {children}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onToggle}
        aria-label={collapsed ? toggleExpandLabel : toggleCollapseLabel}
        className={cn(
          "absolute top-6 z-10 size-7 rounded-full border-border bg-background shadow-md hover:bg-muted",
          isLeft ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2",
          collapsed && "hidden"
        )}
      >
        <CollapsedToggleIcon className="size-3.5" />
      </Button>
    </aside>
  );
}
