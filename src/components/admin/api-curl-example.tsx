"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  buildApiCurlCommand,
  type ApiConsoleEndpoint,
} from "@/lib/external-api-catalog";
import { labels } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ApiCurlExample({
  baseUrl,
  endpoint,
  bearerToken,
  jsonBody,
  className,
}: {
  baseUrl: string;
  endpoint: ApiConsoleEndpoint;
  bearerToken?: string;
  jsonBody?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const curl = useMemo(
    () =>
      baseUrl
        ? buildApiCurlCommand({
            baseUrl,
            endpoint,
            bearerToken,
            jsonBody,
          })
        : "",
    [baseUrl, endpoint, bearerToken, jsonBody]
  );

  async function copy() {
    if (!curl) return;
    await navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!baseUrl) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {labels.admin.apiConsoleCurlLabel}
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-9 w-full sm:w-auto"
          onClick={copy}
        >
          {copied ? (
            <Check className="mr-1 size-4" />
          ) : (
            <Copy className="mr-1 size-4" />
          )}
          {copied ? labels.admin.apiTokensCopied : labels.admin.apiTokensCopy}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-md border bg-background/80 p-3 font-mono text-xs leading-relaxed">
        {curl}
      </pre>
      <p className="text-xs text-muted-foreground">
        {labels.admin.apiConsoleCurlHint}
      </p>
    </div>
  );
}
