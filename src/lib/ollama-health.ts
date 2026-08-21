import { getOllamaKeepAlive } from "@/lib/ollama";
import { isOllamaModelAvailable } from "@/lib/ollama-model";

const OLLAMA_CONNECT_TIMEOUT_MS = 180_000;
const OLLAMA_WARMUP_TIMEOUT_MS = 180_000;
/** Default 3 minutes — refresh keep_alive well before any 5m server default unload. */
const DEFAULT_KEEP_WARM_INTERVAL_MS = 3 * 60 * 1000;

function getKeepWarmIntervalMs(): number {
  const raw = process.env.OLLAMA_KEEP_WARM_INTERVAL_MS?.trim();
  if (!raw) return DEFAULT_KEEP_WARM_INTERVAL_MS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 60_000) {
    return DEFAULT_KEEP_WARM_INTERVAL_MS;
  }
  return parsed;
}

export type OllamaStatus = {
  ok: boolean;
  reachable: boolean;
  modelConfigured: boolean;
  modelLoaded: boolean;
  model: string | null;
  keepAlive: string | number;
  detail: "ready" | "cold" | "unreachable" | "misconfigured";
};

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
 * Production-facing status: reachable + whether the configured model is in RAM.
 * Uses `/api/tags` and `/api/ps` (loaded runners).
 */
export async function getOllamaStatus(): Promise<OllamaStatus> {
  const keepAlive = getOllamaKeepAlive();
  const config = getConfig();
  if (!config) {
    return {
      ok: false,
      reachable: false,
      modelConfigured: false,
      modelLoaded: false,
      model: null,
      keepAlive,
      detail: "misconfigured",
    };
  }

  try {
    const tagsRes = await fetch(`${config.baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!tagsRes.ok) {
      return {
        ok: false,
        reachable: false,
        modelConfigured: true,
        modelLoaded: false,
        model: config.model,
        keepAlive,
        detail: "unreachable",
      };
    }

    const tagsData = (await tagsRes.json()) as {
      models?: Array<{ name?: string; model?: string }>;
    };
    const modelPresent = isOllamaModelAvailable(
      tagsData.models ?? [],
      config.model
    );

    let modelLoaded = false;
    try {
      const psRes = await fetch(`${config.baseUrl}/api/ps`, {
        signal: AbortSignal.timeout(10_000),
      });
      if (psRes.ok) {
        const psData = (await psRes.json()) as {
          models?: Array<{ name?: string; model?: string }>;
        };
        modelLoaded = isOllamaModelAvailable(
          psData.models ?? [],
          config.model
        );
      }
    } catch {
      /* /api/ps optional — treat as cold if unreachable */
    }

    if (!modelPresent) {
      return {
        ok: false,
        reachable: true,
        modelConfigured: true,
        modelLoaded: false,
        model: config.model,
        keepAlive,
        detail: "cold",
      };
    }

    return {
      ok: modelLoaded,
      reachable: true,
      modelConfigured: true,
      modelLoaded,
      model: config.model,
      keepAlive,
      detail: modelLoaded ? "ready" : "cold",
    };
  } catch {
    return {
      ok: false,
      reachable: false,
      modelConfigured: true,
      modelLoaded: false,
      model: config.model,
      keepAlive,
      detail: "unreachable",
    };
  }
}

/**
 * Unload runners that are not the configured model (frees RAM after model switch).
 */
async function unloadOtherModels(
  baseUrl: string,
  targetModel: string
): Promise<void> {
  try {
    const psRes = await fetch(`${baseUrl}/api/ps`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!psRes.ok) return;
    const psData = (await psRes.json()) as {
      models?: Array<{ name?: string; model?: string }>;
    };
    const loaded = psData.models ?? [];
    for (const entry of loaded) {
      const name = (entry.name ?? entry.model ?? "").trim();
      if (!name) continue;
      if (isOllamaModelAvailable([entry], targetModel)) continue;
      await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: name,
          prompt: "",
          stream: false,
          keep_alive: 0,
        }),
        signal: AbortSignal.timeout(60_000),
      }).catch(() => {
        /* best-effort unload */
      });
    }
  } catch {
    /* ignore */
  }
}

/**
 * Load the model into RAM (cold start). Safe to call on startup or before chat.
 * No-op when Ollama env is missing.
 * If another model is pinned with keep_alive=-1, unload it and retry once.
 */
export async function warmOllamaModel(): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  const doWarm = () =>
    fetch(`${config.baseUrl}/api/generate`, {
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

  try {
    const response = await doWarm();
    if (response.ok) return true;

    console.warn(
      "[ollama-health] warm-up HTTP",
      response.status,
      "— unloading other models and retrying"
    );
    await unloadOtherModels(config.baseUrl, config.model);
    const retry = await doWarm();
    return retry.ok;
  } catch (error) {
    console.warn("[ollama-health] warm-up failed, trying unload+retry:", error);
    try {
      await unloadOtherModels(config.baseUrl, config.model);
      const retry = await doWarm();
      return retry.ok;
    } catch (retryError) {
      console.warn("[ollama-health] warm-up retry failed:", retryError);
      return false;
    }
  }
}

let keepWarmTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Periodically warm the model so it stays loaded in RAM continuously.
 * Safe to call once from instrumentation; subsequent calls are no-ops.
 */
export function startOllamaKeepWarm(intervalMs?: number): void {
  if (keepWarmTimer != null) return;
  if (!getConfig()) return;

  const ms = intervalMs ?? getKeepWarmIntervalMs();
  console.info(`[ollama-health] keep-warm every ${Math.round(ms / 1000)}s`);

  keepWarmTimer = setInterval(() => {
    void warmOllamaModel().catch(() => {
      /* logged inside warmOllamaModel */
    });
  }, ms);

  // Do not keep the process alive solely for this timer (Node).
  if (typeof keepWarmTimer === "object" && "unref" in keepWarmTimer) {
    keepWarmTimer.unref();
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

/** Generate request with warm + one retry (AI feedback path). */
export async function fetchOllamaGenerate(
  baseUrl: string,
  body: Record<string, unknown>,
  options?: { retry?: boolean; timeoutMs?: number }
): Promise<Response> {
  const retry = options?.retry ?? true;
  const timeoutMs = options?.timeoutMs ?? OLLAMA_CONNECT_TIMEOUT_MS;

  const doFetch = () =>
    fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

  try {
    const response = await doFetch();
    if (response.ok) return response;
    if (!retry) return response;
  } catch (firstError) {
    if (!retry) throw firstError;
    console.warn(
      "[ollama-health] generate fetch failed, warming model:",
      firstError
    );
  }

  await warmOllamaModel();
  try {
    return await doFetch();
  } catch (retryError) {
    console.warn("[ollama-health] generate retry failed:", retryError);
    throw retryError;
  }
}
