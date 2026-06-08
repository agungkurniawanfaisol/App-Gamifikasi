import type { ApiConsoleEndpointId } from "@/lib/external-api-catalog";
import { labels } from "@/lib/labels";

export type ApiConsoleResponseView = {
  summary: string | null;
  summaryLabel: string | null;
  formatted: string;
  isError: boolean;
};

function prettyJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function extractStreamSummary(lines: string[]): string | null {
  let text = "";
  for (const line of lines) {
    try {
      const chunk = JSON.parse(line) as {
        message?: { content?: string };
        response?: string;
      };
      if (chunk.message?.content) text += chunk.message.content;
      if (typeof chunk.response === "string") text += chunk.response;
    } catch {
      /* skip malformed line */
    }
  }
  return text.trim() || null;
}

export function parseApiConsoleResponse(
  raw: string,
  endpointId: ApiConsoleEndpointId
): ApiConsoleResponseView {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { summary: null, summaryLabel: null, formatted: "—", isError: false };
  }

  try {
    const data = JSON.parse(trimmed) as Record<string, unknown>;

    if (typeof data.error === "string") {
      return {
        summary: data.error,
        summaryLabel: labels.admin.apiConsoleResponseError,
        formatted: prettyJson(data),
        isError: true,
      };
    }

    if (endpointId === "chat" && data.message && typeof data.message === "object") {
      const content = (data.message as { content?: string }).content;
      if (typeof content === "string" && content.length > 0) {
        return {
          summary: content,
          summaryLabel: labels.admin.apiConsoleResponseAssistant,
          formatted: prettyJson(data),
          isError: false,
        };
      }
    }

    if (endpointId === "generate" && typeof data.response === "string") {
      return {
        summary: data.response,
        summaryLabel: labels.admin.apiConsoleResponseGenerated,
        formatted: prettyJson(data),
        isError: false,
      };
    }

    if (endpointId === "models" && Array.isArray(data.models)) {
      const names = (data.models as Array<{ name?: string; model?: string }>)
        .map((m) => m.name ?? m.model)
        .filter(Boolean)
        .join(", ");
      return {
        summary: names || null,
        summaryLabel: names ? labels.admin.apiConsoleResponseModels : null,
        formatted: prettyJson(data),
        isError: false,
      };
    }

    return {
      summary: null,
      summaryLabel: null,
      formatted: prettyJson(data),
      isError: false,
    };
  } catch {
    const streamLines = trimmed.split("\n---\n").flatMap((block) =>
      block.split("\n").filter(Boolean)
    );
    const streamSummary = extractStreamSummary(streamLines);
    if (streamSummary) {
      return {
        summary: streamSummary,
        summaryLabel: labels.admin.apiConsoleResponseStream,
        formatted: trimmed,
        isError: false,
      };
    }

    return {
      summary: null,
      summaryLabel: null,
      formatted: trimmed,
      isError: false,
    };
  }
}

export function formatStreamApiResponse(accumulated: string): ApiConsoleResponseView {
  const lines = accumulated.split("\n").filter(Boolean);
  const formatted = lines
    .map((line) => {
      try {
        return prettyJson(JSON.parse(line));
      } catch {
        return line;
      }
    })
    .join("\n---\n");

  const summary = extractStreamSummary(lines);

  return {
    summary,
    summaryLabel: summary ? labels.admin.apiConsoleResponseStream : null,
    formatted: formatted || "—",
    isError: false,
  };
}
