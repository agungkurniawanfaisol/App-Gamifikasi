"use client";

import { useEffect, useState } from "react";
import { formatDateTimeWib } from "@/lib/format-date";
import { cn } from "@/lib/utils";

/**
 * Renders a timestamp in WIB after mount to avoid SSR/client timezone hydration mismatches.
 */
export function FormattedDateTime({
  value,
  className,
}: {
  value: string | Date | null | undefined;
  className?: string;
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(formatDateTimeWib(value));
  }, [value]);

  if (value == null || value === "") return null;

  return (
    <span className={cn(className)} suppressHydrationWarning>
      {text || "\u00a0"}
    </span>
  );
}
