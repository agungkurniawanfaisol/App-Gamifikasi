import { z } from "zod";

const stripNullBytes = (s: string) => s.replace(/\0/g, "");

export const MAX_PROMPT_LENGTH = 8192;
export const MAX_MESSAGES = 32;
export const MAX_BODY_BYTES = 256 * 1024;

export const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z
    .string()
    .max(MAX_PROMPT_LENGTH)
    .transform(stripNullBytes),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(MAX_MESSAGES),
  stream: z.boolean().optional().default(false),
  model: z.string().max(128).optional(),
});

export const generateRequestSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .max(MAX_PROMPT_LENGTH)
    .transform(stripNullBytes),
  stream: z.boolean().optional().default(false),
  model: z.string().max(128).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export function parseJsonBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).join("; ");
    return { ok: false, error: msg || "Invalid request body" };
  }
  return { ok: true, data: result.data };
}
