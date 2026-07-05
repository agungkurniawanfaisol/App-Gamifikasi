export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { warmOllamaModel } = await import("@/lib/ollama-health");
  void warmOllamaModel().catch(() => {
    /* Ollama may not be ready yet at boot — chat route retries on first request */
  });
}
