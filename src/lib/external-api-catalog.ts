import type { ApiTokenScope } from "@/lib/external-api-token";

export type ApiConsoleEndpointId =
  | "discovery"
  | "models"
  | "chat"
  | "generate";

export type ApiConsoleEndpoint = {
  id: ApiConsoleEndpointId;
  method: "GET" | "POST";
  path: string;
  scope: ApiTokenScope | null;
  defaultBody?: string;
};

export const API_CONSOLE_ENDPOINTS: ApiConsoleEndpoint[] = [
  { id: "discovery", method: "GET", path: "/api/v1", scope: null },
  { id: "models", method: "GET", path: "/api/v1/models", scope: "models" },
  {
    id: "chat",
    method: "POST",
    path: "/api/v1/chat",
    scope: "chat",
    defaultBody: JSON.stringify(
      {
        messages: [
          { role: "user", content: "Hello! What can you help me learn?" },
        ],
        stream: false,
      },
      null,
      2
    ),
  },
  {
    id: "generate",
    method: "POST",
    path: "/api/v1/generate",
    scope: "generate",
    defaultBody: JSON.stringify(
      {
        prompt: "Write a short haiku about learning English.",
        stream: false,
      },
      null,
      2
    ),
  },
];

export function getApiConsoleEndpoint(id: string): ApiConsoleEndpoint {
  return (
    API_CONSOLE_ENDPOINTS.find((ep) => ep.id === id) ?? API_CONSOLE_ENDPOINTS[0]!
  );
}

function compactJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw));
  } catch {
    return raw.trim();
  }
}

/** Escape a string for use inside single-quoted shell arguments. */
function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export function buildApiCurlCommand(input: {
  baseUrl: string;
  endpoint: ApiConsoleEndpoint;
  bearerToken?: string;
  jsonBody?: string;
}): string {
  const base = input.baseUrl.replace(/\/$/, "");
  const url = `${base}${input.endpoint.path}`;
  const token = input.bearerToken?.trim() || "YOUR_BEARER_TOKEN";

  const lines = [`curl -X ${input.endpoint.method} ${shellQuote(url)}`];

  if (input.endpoint.scope) {
    lines.push(`  -H ${shellQuote(`Authorization: Bearer ${token}`)}`);
  }

  if (input.endpoint.method === "POST") {
    lines.push(`  -H ${shellQuote("Content-Type: application/json")}`);
    const raw =
      input.jsonBody?.trim() || input.endpoint.defaultBody || "{}";
    lines.push(`  -d ${shellQuote(compactJson(raw))}`);
  }

  return lines.join(" \\\n");
}
