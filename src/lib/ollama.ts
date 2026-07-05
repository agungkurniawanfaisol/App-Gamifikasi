function getOllamaConfig(): { baseUrl: string; model: string } {
  const baseUrl = process.env.OLLAMA_BASE_URL;
  const model = process.env.OLLAMA_MODEL;
  if (!baseUrl) throw new Error("OLLAMA_BASE_URL is not set");
  if (!model) throw new Error("OLLAMA_MODEL is not set");
  return { baseUrl, model };
}

/** Ollama default is 5m; longer keep_alive avoids cold reload between chat turns. */
const DEFAULT_OLLAMA_KEEP_ALIVE = "30m";

/** Cap learn-step excerpt size to keep chat prompts fast. */
export const MAX_LEARN_STEP_CONTENT_CHARS = 2_500;

export const CHAT_HISTORY_LIMIT = 12;

export function trimLearnStepContent(content?: string | null): string | null {
  const trimmed = content?.trim();
  if (!trimmed) return null;
  if (trimmed.length <= MAX_LEARN_STEP_CONTENT_CHARS) return trimmed;
  return `${trimmed.slice(0, MAX_LEARN_STEP_CONTENT_CHARS)}…`;
}

export function getOllamaKeepAlive(): string | number {
  const raw = process.env.OLLAMA_KEEP_ALIVE?.trim();
  if (!raw) return DEFAULT_OLLAMA_KEEP_ALIVE;
  // Ollama API expects JSON number -1 for indefinite; string "-1" causes 400.
  if (raw === "-1") return -1;
  return raw;
}

export const BRADER_BASE_PROMPT = `You are Brader Saintek Unipda, the campus AI assistant for Universitas PGRI Delta (Unipda).
You were developed by Tim Saintek Akreditasi.
Reply in the same language as the user (Indonesian or English).
Be friendly and accurate. Give complete answers — do not cut off lists, steps, or explanations mid-way. If you are unsure, say so instead of guessing.`;

/** @deprecated Use buildBraderSystemPrompt() for new code. */
export const CHAT_SYSTEM_PROMPT = BRADER_BASE_PROMPT;

export function buildBraderSystemPrompt(referenceFacts?: string | null): string {
  const facts = referenceFacts?.trim()
    ? `\nReference facts (prefer these over guessing; when they answer the question, reproduce them fully without omitting items):\n${referenceFacts.trim()}`
    : "";
  return `${BRADER_BASE_PROMPT}${facts}`;
}

export type LearnChatPhase = "pretest" | "content" | "posttest";

export type LearnChatContextInput = {
  groupTitle: string;
  levelName: string;
  phase: LearnChatPhase;
  stepLabel: string;
  stepContent?: string | null;
};

export function buildLearnChatSystemPrompt(
  ctx: LearnChatContextInput,
  referenceFacts?: string | null
): string {
  const stepExcerpt = trimLearnStepContent(ctx.stepContent);
  const contentBlock = stepExcerpt
    ? `\nCurrent step content excerpt:\n${stepExcerpt}`
    : "";

  return `${buildBraderSystemPrompt(referenceFacts)}

You are helping a student in the learning group "${ctx.groupTitle}" (${ctx.levelName} level).
Current phase: ${ctx.phase}.
Current step: ${ctx.stepLabel}.${contentBlock}

Guidelines:
- Reply in the same language as the student (Indonesian or English).
- Help the student understand the material; use hints and explanations first.
- Do not give direct answers to quiz or test questions unless the student has already attempted them and needs clarification.
- Keep responses concise and encouraging (2–5 short paragraphs max unless asked for more).`;
}

export function buildFeedbackPrompt(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  explanation?: string | null
): string {
  const explainPart = explanation ? ` Explanation: ${explanation}.` : "";
  return `The student answered "${userAnswer}" for the question: "${question}". The correct answer is "${correctAnswer}".${explainPart} Provide brief feedback in English (maximum 3 sentences) that helps the student understand why their answer was correct or incorrect.`;
}

export type GroupCompletionPromptInput = {
  groupTitle: string;
  levelLabel: string;
  scorePercent: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctSubAnswers: number;
  totalSubAnswers: number;
  skillSummary: Record<string, { correct: number; total: number }>;
};

export function buildGroupCompletionPrompt(
  input: GroupCompletionPromptInput
): string {
  const skillLines = Object.entries(input.skillSummary)
    .map(
      ([skill, stats]) =>
        `- ${skill}: ${stats.correct}/${stats.total} sub-questions correct`
    )
    .join("\n");

  const skillBlock = skillLines ? `\nSkill breakdown:\n${skillLines}` : "";

  return `You are an English learning coach. A student just finished the learning group "${input.groupTitle}" (${input.levelLabel} level).

Overall score: ${input.scorePercent}%
Questions answered: ${input.answeredQuestions}/${input.totalQuestions}
Sub-questions correct: ${input.correctSubAnswers}/${input.totalSubAnswers}${skillBlock}

Write encouraging completion feedback in English (3–5 short sentences). Mention their score, highlight one strength, and give one concrete tip to improve. Do not use bullet points.`;
}

export async function generateFeedback(prompt: string): Promise<string> {
  try {
    const { baseUrl, model } = getOllamaConfig();
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        keep_alive: getOllamaKeepAlive(),
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama error ${response.status}`);
    }
    const data = (await response.json()) as { response?: string };
    return data.response ?? "Unable to generate feedback right now.";
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate feedback: ${error.message}`);
    }
    throw new Error("Failed to generate feedback");
  }
}

export async function streamChat(
  prompt: string,
  onChunk: (text: string) => void,
  systemPrompt = CHAT_SYSTEM_PROMPT
): Promise<void> {
  try {
    const { baseUrl, model } = getOllamaConfig();
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        stream: true,
        keep_alive: getOllamaKeepAlive(),
        options: OLLAMA_CHAT_OPTIONS,
      }),
    });
    if (!response.ok || !response.body) {
      throw new Error(`Ollama chat error ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const chunk = JSON.parse(trimmed) as {
            message?: { content?: string };
          };
          if (chunk.message?.content) onChunk(chunk.message.content);
        } catch {
          /* skip malformed */
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to stream chat: ${error.message}`);
    }
    throw new Error("Failed to stream chat");
  }
}

export async function streamChatWithHistory(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  onChunk: (text: string) => void
): Promise<void> {
  const { baseUrl, model } = getOllamaConfig();
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      keep_alive: getOllamaKeepAlive(),
      options: OLLAMA_CHAT_OPTIONS,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok || !response.body) {
    throw new Error(`Ollama chat error ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const chunk = JSON.parse(trimmed) as {
          message?: { content?: string };
        };
        if (chunk.message?.content) onChunk(chunk.message.content);
      } catch {
        /* skip */
      }
    }
  }
}

const OLLAMA_TIMEOUT_MS = 120_000;

export type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/** Enough tokens for long campus FAQ / lecturer lists without cutting off mid-answer. */
export const OLLAMA_CHAT_OPTIONS = {
  num_predict: 4096,
  temperature: 0.3,
} as const;

/** Tune per message length — shorter cap = faster replies on CPU-only VPS. */
export function getOllamaChatOptions(userMessage: string): Record<string, number> {
  const short = userMessage.trim().length <= 100;
  const threads = Number.parseInt(process.env.OLLAMA_NUM_THREADS ?? "", 10);
  const options: Record<string, number> = {
    num_predict: short ? 256 : 1536,
    num_ctx: short ? 2048 : 4096,
    temperature: 0.3,
  };
  if (Number.isFinite(threads) && threads > 0) {
    options.num_thread = threads;
  }
  return options;
}

export async function ollamaChat(
  messages: OllamaChatMessage[],
  options?: { model?: string; stream?: boolean }
): Promise<Response> {
  const { baseUrl, model: defaultModel } = getOllamaConfig();
  const model = options?.model ?? defaultModel;
  const stream = options?.stream ?? false;

  return fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream,
      keep_alive: getOllamaKeepAlive(),
      options: OLLAMA_CHAT_OPTIONS,
    }),
    signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
  });
}

export async function ollamaGenerate(
  prompt: string,
  options?: { model?: string; stream?: boolean }
): Promise<Response> {
  const { baseUrl, model: defaultModel } = getOllamaConfig();
  const model = options?.model ?? defaultModel;
  const stream = options?.stream ?? false;

  return fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream,
      keep_alive: getOllamaKeepAlive(),
    }),
    signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
  });
}

export async function ollamaListModels(): Promise<Response> {
  const { baseUrl } = getOllamaConfig();
  return fetch(`${baseUrl}/api/tags`, {
    signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
  });
}
