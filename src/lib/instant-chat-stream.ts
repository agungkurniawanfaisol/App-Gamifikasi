/** Stream plain text for student chat (instant FAQ short-circuit). */
export function createPlainTextStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

/** Ollama-compatible NDJSON stream for external API stream mode. */
export function createOllamaStyleStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const payload = JSON.stringify({
    model: "assistant-knowledge",
    created_at: new Date().toISOString(),
    message: { role: "assistant", content: text },
    done: true,
  });

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`${payload}\n`));
      controller.close();
    },
  });
}

/** Ollama-compatible JSON body for external API non-stream mode. */
export function createOllamaStyleJson(text: string) {
  return {
    model: "assistant-knowledge",
    created_at: new Date().toISOString(),
    message: { role: "assistant", content: text },
    done: true,
  };
}
