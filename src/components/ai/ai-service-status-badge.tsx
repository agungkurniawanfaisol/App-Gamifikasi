"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

type AiStatusDetail = "ready" | "cold" | "unreachable" | "misconfigured";

type AiStatusResponse = {
  ok: boolean;
  reachable: boolean;
  modelLoaded: boolean;
  detail: AiStatusDetail;
};

const POLL_MS = 60_000;

export function AiServiceStatusBadge({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<AiStatusResponse | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/status", {
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok && res.status !== 503) {
        setStatus({
          ok: false,
          reachable: false,
          modelLoaded: false,
          detail: "unreachable",
        });
        return;
      }
      const data = (await res.json()) as AiStatusResponse;
      setStatus(data);
    } catch {
      setStatus({
        ok: false,
        reachable: false,
        modelLoaded: false,
        detail: "unreachable",
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  const detail = status?.detail ?? null;
  const label =
    detail == null
      ? labels.student.aiStatusChecking
      : detail === "ready"
        ? labels.student.aiStatusReady
        : detail === "cold"
          ? labels.student.aiStatusWarming
          : labels.student.aiStatusOffline;

  const variant =
    detail === "ready"
      ? "success"
      : detail === "cold" || detail == null
        ? "secondary"
        : "destructive";

  return (
    <Badge
      variant={variant}
      className={cn(
        "gap-1.5 font-medium",
        compact ? "text-[10px] px-2 py-0.5" : "text-xs",
        className
      )}
      title={
        detail === "cold"
          ? labels.student.aiStatusWarmingHint
          : detail === "unreachable" || detail === "misconfigured"
            ? labels.student.aiStatusOfflineHint
            : undefined
      }
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          detail === "ready" && "bg-emerald-400",
          (detail === "cold" || detail == null) && "bg-amber-400 animate-pulse",
          (detail === "unreachable" || detail === "misconfigured") &&
            "bg-red-400"
        )}
        aria-hidden
      />
      {label}
    </Badge>
  );
}
