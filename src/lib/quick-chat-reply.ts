/** Skip Ollama for trivial greetings — instant response on CPU-only servers. */
export function tryQuickChatReply(message: string): string | null {
  const normalized = message
    .trim()
    .toLowerCase()
    .replace(/[!?.…]+$/u, "")
    .replace(/\s+/g, " ");

  if (!normalized) return null;

  if (/^(hai|halo|helo|p|hallo)$/.test(normalized)) {
    return "Halo! Saya Brader Saintek Unipda. Ada yang bisa saya bantu dengan pembelajaran Anda hari ini?";
  }

  if (/^(hi|hello|hey|yo|ping|test)$/.test(normalized)) {
    return "Hi! I'm Brader Saintek Unipda. How can I help you with your learning today?";
  }

  return null;
}
