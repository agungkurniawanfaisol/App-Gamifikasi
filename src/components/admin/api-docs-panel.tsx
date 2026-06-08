"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { labels } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { API_CONSOLE_ENDPOINTS } from "@/lib/external-api-catalog";
import { ApiEndpointGuide } from "@/components/admin/api-endpoint-guide";

type ApiDocsPanelProps = {
  baseUrl: string;
};

export function ApiDocsPanel({ baseUrl }: ApiDocsPanelProps) {
  const [discovery, setDiscovery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/v1");
        const data = await res.json();
        if (!cancelled) {
          setDiscovery(JSON.stringify(data, null, 2));
        }
      } catch {
        if (!cancelled) setError(labels.errors.serverError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const exampleToken = "YOUR_BEARER_TOKEN";
  const apiBase = `${baseUrl}/api/v1`;

  const curlChat = `curl -X POST "${apiBase}/chat" \\
  -H "Authorization: Bearer ${exampleToken}" \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":"Hello"}],"stream":false}'`;

  const fetchChat = `const res = await fetch("${apiBase}/chat", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${exampleToken}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello" }],
    stream: false,
  }),
});
const data = await res.json();`;

  const pythonChat = `import requests

response = requests.post(
    "${apiBase}/chat",
    headers={"Authorization": "Bearer ${exampleToken}"},
    json={
        "messages": [{"role": "user", "content": "Hello"}],
        "stream": False,
    },
    timeout=30,
)
response.raise_for_status()
print(response.json())`;

  async function copyDiscovery() {
    if (!discovery) return;
    await navigator.clipboard.writeText(discovery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const steps = [
    labels.admin.apiDocsStep1,
    labels.admin.apiDocsStep2,
    labels.admin.apiDocsStep3,
    labels.admin.apiDocsStep4,
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {labels.admin.apiDocsDescription}
        </p>
        <p className="text-sm leading-relaxed text-foreground/90">
          {labels.admin.apiDocsOverview}
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{labels.admin.apiDocsEndpointReference}</h3>
        <div className="flex flex-col gap-4">
          {API_CONSOLE_ENDPOINTS.map((ep) => (
            <div key={ep.id} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                  {ep.method}
                </span>
                <code className="font-mono text-xs sm:text-sm">{ep.path}</code>
              </div>
              <ApiEndpointGuide
                endpointId={ep.id}
                examplePayload={ep.defaultBody}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{labels.admin.apiDocsDiscovery}</h3>
        {loading && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {!loading && discovery && (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute right-2 top-2 min-h-9"
              onClick={copyDiscovery}
            >
              {copied ? (
                <Check className="mr-1 size-4" />
              ) : (
                <Copy className="mr-1 size-4" />
              )}
              {labels.admin.apiDocsCopyJson}
            </Button>
            <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/50 p-4 pt-12 font-mono text-xs sm:text-sm">
              {discovery}
            </pre>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Usage</h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">{labels.admin.apiDocsCorsNote}</p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{labels.admin.apiDocsExamples}</h3>
        <div className="space-y-2">
          <CodeBlock title={labels.admin.apiDocsExampleCurl} code={curlChat} />
          <CodeBlock title={labels.admin.apiDocsExampleFetch} code={fetchChat} />
          <CodeBlock title={labels.admin.apiDocsExamplePython} code={pythonChat} />
        </div>
      </section>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="min-h-11 w-full sm:w-auto">
            OpenAPI 3.0 JSON
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <p className="mb-2 text-sm text-muted-foreground">
            Import into Postman:{" "}
            <code className="rounded bg-muted px-1">{apiBase}/openapi.json</code>
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Collapsible defaultOpen={title.includes("curl")}>
      <div className="flex items-center justify-between gap-2 rounded-t-lg border border-b-0 bg-muted/30 px-3 py-2">
        <CollapsibleTrigger className="text-sm font-medium hover:underline">
          {title}
        </CollapsibleTrigger>
        <Button type="button" variant="ghost" size="sm" className="min-h-9" onClick={copy}>
          {copied ? labels.admin.apiTokensCopied : labels.admin.apiTokensCopy}
        </Button>
      </div>
      <CollapsibleContent>
        <pre
          className={cn(
            "overflow-x-auto rounded-b-lg border bg-muted/50 p-4",
            "font-mono text-xs"
          )}
        >
          {code}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}
