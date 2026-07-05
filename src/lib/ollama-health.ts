import { getOllamaKeepAlive } from "@/lib/ollama";

const OLLAMA_CONNECT_TIMEOUT_MS = 180_000;
const OLLAMA_WARMUP_TIMEOUT_MS = 180_000;

function getConfig(): { baseUrl: string; model: string } | null {
  const baseUrl = process.env.OLLAMA_BASE_URL?.trim();
  const model = process.env.OLLAMA_MODEL?.trim();
  if (!baseUrl || !model) return null;
  return { baseUrl, model };
}

/** Lightweight ping — Ollama server is reachable. */
export async function pingOllama(): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  try {
    const response = await fetch(`${config.baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(15_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Load the model into RAM (cold start). Safe to call on startup or before chat.
 * No-op when Ollama env is missing.
 */
export async function warmOllamaModel(): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  try {
    const response = await fetch(`${config.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        prompt: "ping",
        stream: false,
        keep_alive: getOllamaKeepAlive(),
      }),
      signal: AbortSignal.timeout(OLLAMA_WARMUP_TIMEOUT_MS),
    });
    return response.ok;
  } catch (error) {
    console.warn("[ollama-health] warm-up failed:", error);
    return false;
  }
}

/** Chat request with one retry after warm-up (handles cold start / idle unload). */
export async function fetchOllamaChatStream(
  baseUrl: string,
  body: Record<string, unknown>,
  options?: { retry?: boolean }
): Promise<Response> {
  const retry = options?.retry ?? true;

  const doFetch = () =>
    fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(OLLAMA_CONNECT_TIMEOUT_MS),
    });

  try {
    const response = await doFetch();
    if (response.ok && response.body) return response;
    if (!retry) return response;
  } catch (firstError) {
    if (!retry) throw firstError;
    console.warn("[ollama-health] chat fetch failed, warming model:", firstError);
  }

  await warmOllamaModel();
  try {
    return await doFetch();
  } catch (retryError) {
    console.warn("[ollama-health] chat retry failed:", retryError);
    throw retryError;
  }
}
