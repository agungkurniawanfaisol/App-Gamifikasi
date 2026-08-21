export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { warmOllamaModel, startOllamaKeepWarm } = await import(
    "@/lib/ollama-health"
  );

  void warmOllamaModel().catch(() => {
    /* Ollama may not be ready yet at boot — chat route retries on first request */
  });

  // Re-warm every few minutes so the model stays in RAM (spare RAM is expected).
  startOllamaKeepWarm();
}
