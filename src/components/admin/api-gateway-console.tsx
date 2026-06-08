"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Eye,
  EyeOff,
  Play,
  Trash2,
} from "lucide-react";
import { labels } from "@/lib/labels";
import {
  API_CONSOLE_ENDPOINTS,
  getApiConsoleEndpoint,
  type ApiConsoleEndpointId,
} from "@/lib/external-api-catalog";
import { ApiEndpointGuide } from "@/components/admin/api-endpoint-guide";
import { ApiCurlExample } from "@/components/admin/api-curl-example";
import {
  formatStreamApiResponse,
  parseApiConsoleResponse,
  type ApiConsoleResponseView,
} from "@/lib/api-console-response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const API_CONSOLE_TOKEN_KEY = "ngf_api_console_token";

export function ApiGatewayConsole() {
  const [presetId, setPresetId] = useState<ApiConsoleEndpointId>("chat");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [body, setBody] = useState(
    API_CONSOLE_ENDPOINTS.find((e) => e.id === "chat")?.defaultBody ?? ""
  );
  const [response, setResponse] = useState<ApiConsoleResponseView | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(API_CONSOLE_TOKEN_KEY);
    if (stored) setToken(stored);
  }, []);

  useEffect(() => {
    if (token) sessionStorage.setItem(API_CONSOLE_TOKEN_KEY, token);
    else sessionStorage.removeItem(API_CONSOLE_TOKEN_KEY);
  }, [token]);

  const preset = getApiConsoleEndpoint(presetId);

  const handlePresetChange = (id: ApiConsoleEndpointId) => {
    setPresetId(id);
    const next = getApiConsoleEndpoint(id);
    if (next.defaultBody) setBody(next.defaultBody);
    else setBody("");
    setResponse(null);
    setStatus(null);
    setDurationMs(null);
    setError(null);
  };

  const formatJson = () => {
    try {
      setBody(JSON.stringify(JSON.parse(body), null, 2));
      setError(null);
    } catch {
      setError(labels.admin.apiConsoleInvalidJson);
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(body);
      setError(null);
    } catch {
      setError(labels.admin.apiConsoleInvalidJson);
    }
  };

  const sendRequest = useCallback(() => {
    setError(null);
    setResponse(null);
    setStatus(null);
    setDurationMs(null);

    startTransition(async () => {
      const start = performance.now();
      try {
        const headers: Record<string, string> = {};
        if (token.trim()) headers.Authorization = `Bearer ${token.trim()}`;
        if (preset.method === "POST") headers["Content-Type"] = "application/json";

        let fetchBody: string | undefined;
        if (preset.method === "POST") {
          try {
            fetchBody = JSON.stringify(JSON.parse(body));
          } catch {
            setError(labels.admin.apiConsoleInvalidJson);
            return;
          }
        }

        const res = await fetch(preset.path, {
          method: preset.method,
          headers,
          body: fetchBody,
        });

        setStatus(res.status);
        setDurationMs(Math.round(performance.now() - start));

        const contentType = res.headers.get("content-type") ?? "";
        const isStream =
          contentType.includes("ndjson") ||
          contentType.includes("stream");

        if (isStream && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
          }
          setResponse(formatStreamApiResponse(accumulated));
          return;
        }

        const text = await res.text();
        setResponse(parseApiConsoleResponse(text, preset.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : labels.errors.serverError);
      }
    });
  }, [body, preset, token]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {labels.admin.apiConsoleDescription}
        </p>
        <p className="text-sm leading-relaxed text-foreground/90">
          {labels.admin.apiConsoleOverview}
        </p>
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-900 dark:text-amber-100">
        {labels.admin.apiTokensSecurityWarning}
      </div>

      <div className="space-y-2">
        <Label>{labels.admin.apiConsoleEndpoint}</Label>
        <div
          className="flex flex-col gap-2"
          role="tablist"
          aria-label={labels.admin.apiConsoleEndpoint}
        >
          {API_CONSOLE_ENDPOINTS.map((ep) => {
            const active = presetId === ep.id;
            return (
              <button
                key={ep.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handlePresetChange(ep.id)}
                className={cn(
                  "flex min-h-11 w-full flex-col gap-1 rounded-lg border px-4 py-3 text-left transition-colors sm:flex-row sm:items-center sm:gap-3",
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:bg-muted/50"
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Badge
                    variant={ep.method === "GET" ? "secondary" : "default"}
                    className="shrink-0 font-mono text-[10px] uppercase"
                  >
                    {ep.method}
                  </Badge>
                  <span className="min-w-0 truncate font-mono text-xs sm:text-sm">
                    {ep.path}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground sm:ms-auto sm:shrink-0">
                  {ep.scope
                    ? labels.admin.apiConsoleScopeRequired(ep.scope)
                    : labels.admin.apiConsoleScopePublic}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ApiEndpointGuide
        endpointId={presetId}
        examplePayload={preset.defaultBody}
      />

      <div className="space-y-2">
          <Label htmlFor="console-token">{labels.admin.apiConsoleBearerToken}</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Input
                id="console-token"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ngf_live_..."
                className="min-h-11 pr-10"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-9 -translate-y-1/2"
                onClick={() => setShowToken((v) => !v)}
                aria-label={showToken ? "Hide token" : "Show token"}
              >
                {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={() => {
                setToken("");
                sessionStorage.removeItem(API_CONSOLE_TOKEN_KEY);
              }}
            >
              <Trash2 className="mr-2 size-4" />
              {labels.admin.apiConsoleClearToken}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {labels.admin.apiConsoleBearerHint}
          </p>
        </div>

      {preset.method === "POST" && (
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Label htmlFor="console-body">{labels.admin.apiConsoleRequestBody}</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11 w-full sm:w-auto"
                onClick={validateJson}
              >
                {labels.admin.apiConsoleValidateJson}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11 w-full sm:w-auto"
                onClick={formatJson}
              >
                {labels.admin.apiConsoleFormatJson}
              </Button>
            </div>
          </div>
          <Textarea
            id="console-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
        </div>
      )}

      <ApiCurlExample
        baseUrl={baseUrl}
        endpoint={preset}
        bearerToken={token}
        jsonBody={preset.method === "POST" ? body : undefined}
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="button"
        className="min-h-11 w-full sm:w-auto"
        disabled={pending}
        onClick={sendRequest}
      >
        <Play className="mr-2 size-4" />
        {pending ? labels.admin.apiConsoleSending : labels.admin.apiConsoleSend}
      </Button>

      {(status !== null || response) && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{labels.admin.apiConsoleResponse}</h3>
            {status !== null && (
              <Badge variant={status >= 200 && status < 300 ? "default" : "destructive"}>
                {labels.admin.apiConsoleStatus}: {status}
              </Badge>
            )}
            {durationMs !== null && (
              <span className="text-xs text-muted-foreground">
                {labels.admin.apiConsoleDuration}: {durationMs}ms
              </span>
            )}
          </div>

          {response?.summary && (
            <div
              className={cn(
                "rounded-lg border p-4 sm:p-5",
                response.isError
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-primary/25 bg-primary/5"
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {response.summaryLabel}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                {response.summary}
              </p>
            </div>
          )}

          {response?.summary && !response.isError && (
            <p className="text-xs text-muted-foreground">
              {labels.admin.apiConsoleResponseHint}
            </p>
          )}

          {response && (
            <details
              className="rounded-lg border bg-muted/30"
              open={!response.summary}
            >
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                {response.summary
                  ? labels.admin.apiConsoleResponseFull
                  : labels.admin.apiConsoleResponse}
              </summary>
              <pre
                className={cn(
                  "max-h-[480px] overflow-auto border-t px-4 py-3",
                  "font-mono text-xs sm:text-sm"
                )}
              >
                {response.formatted}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export function storeConsoleToken(plaintext: string) {
  sessionStorage.setItem(API_CONSOLE_TOKEN_KEY, plaintext);
}
