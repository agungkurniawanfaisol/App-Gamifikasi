// Helpers for matching Ollama model names from /api/tags

/**
 * Normalize model name for comparison (handles name vs model fields, tags, digests).
 */
export function normalizeOllamaModelName(name: string): string {
  const trimmed = name.trim().toLowerCase();
  const withoutDigest = trimmed.split("-")[0];
  const parts = withoutDigest.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return withoutDigest;
}

/**
 * Check if the target model (from OLLAMA_MODEL env) exists in Ollama's model list.
 */
export function isOllamaModelAvailable(
  models: Array<{ name?: string; model?: string }>,
  target: string
): boolean {
  const normalizedTarget = normalizeOllamaModelName(target);

  return models.some((entry) => {
    const candidate = entry.name ?? entry.model ?? "";
    if (!candidate) return false;

    const normalized = normalizeOllamaModelName(candidate);
    return (
      normalized === normalizedTarget ||
      normalized.startsWith(`${normalizedTarget}-`) ||
      normalizedTarget.startsWith(`${normalized}-`)
    );
  });
}
