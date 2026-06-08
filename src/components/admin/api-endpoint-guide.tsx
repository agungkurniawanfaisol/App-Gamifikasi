"use client";

import { labels } from "@/lib/labels";
import type { ApiConsoleEndpointId } from "@/lib/external-api-catalog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ApiEndpointGuide({
  endpointId,
  examplePayload,
  className,
}: {
  endpointId: ApiConsoleEndpointId;
  examplePayload?: string;
  className?: string;
}) {
  const info = labels.admin.apiConsoleEndpoints[endpointId];
  const sections = [
    { title: labels.admin.apiConsolePurposeLabel, body: info.purpose },
    { title: labels.admin.apiConsoleAuthLabel, body: info.auth },
    ...(info.payload
      ? [{ title: labels.admin.apiConsolePayloadLabel, body: info.payload }]
      : []),
    { title: labels.admin.apiConsoleResponseLabel, body: info.response },
  ];

  return (
    <div
      className={cn(
        "space-y-4 rounded-lg border border-border/80 bg-muted/20 p-4 sm:p-5",
        className
      )}
    >
      {sections.map(({ title, body }) => (
        <div key={title} className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h4>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {body}
          </p>
        </div>
      ))}

      {examplePayload && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {labels.admin.apiConsoleExamplePayloadLabel}
            </h4>
            <Badge variant="outline" className="font-mono text-[10px]">
              JSON
            </Badge>
          </div>
          <pre className="overflow-x-auto rounded-md border bg-background/80 p-3 font-mono text-xs">
            {examplePayload}
          </pre>
        </div>
      )}
    </div>
  );
}
