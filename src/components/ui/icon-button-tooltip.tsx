"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type IconButtonTooltipProps = {
  label: string;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
};

export function IconButtonTooltip({
  label,
  children,
  side = "top",
}: IconButtonTooltipProps) {
  return (
    <Tooltip delayDuration={250}>
      <TooltipTrigger asChild>
        <span className="inline-flex">{children}</span>
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
