import { Prisma, QuestionFormat, QuestionSkill } from "@prisma/client";

// ─── TipTap JSON helpers ───────────────────────────────────────────────

export function tiptapDoc(content: Record<string, unknown>[]): string {
  return JSON.stringify({ type: "doc", content });
}

export function p(text: string): Record<string, unknown> {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

export function heading(level: number, text: string): Record<string, unknown> {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

export function bulletList(items: string[]): Record<string, unknown> {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [{ type: "text", text: item }] }],
    })),
  };
}

export function italicTag(text: string): string {
  return text;
}

// ─── Sub-question helpers ──────────────────────────────────────────────

export interface SubQInput {
  order: number;
  skill: QuestionSkill;
  format: QuestionFormat;
  weightPercent: number;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  expectedSpeech?: string;
  audioUrl?: string;
  explanation?: string;
  essayRubric?: string;
}

export function sq(input: SubQInput) {
  return {
    id: crypto.randomUUID(),
    ...input,
  };
}

export type SubQuestion = ReturnType<typeof sq>;

export function legacyFromSubs(subQuestions: SubQuestion[]) {
  const first = subQuestions[0]!;
  return {
    questionText: first.questionText,
    skill: first.skill,
    format: first.format,
    options: first.options ?? Prisma.JsonNull,
    correctAnswer: first.correctAnswer ?? null,
    expectedSpeech: first.expectedSpeech ?? null,
    audioUrl: first.audioUrl ?? null,
    explanation: first.explanation ?? null,
    essayRubric: first.essayRubric ?? null,
  };
}

// ─── Content item types ────────────────────────────────────────────────

export interface MaterialInput {
  title: string;
  contentNodes: Record<string, unknown>[];
}

export function buildMaterial(input: MaterialInput, order: number) {
  return {
    type: "MATERIAL" as const,
    order,
    title: input.title,
    content: tiptapDoc(input.contentNodes),
  };
}

export function buildQuestion(subQuestions: SubQuestion[], order: number) {
  return {
    type: "QUESTION" as const,
    order,
    title: null,
    content: null,
    subQuestions,
    ...legacyFromSubs(subQuestions),
  };
}

export type ContentItem =
  | ReturnType<typeof buildMaterial>
  | ReturnType<typeof buildQuestion>;

/** Distribute 100% across `count` sub-questions (each 1–100, sum = 100). */
export function distributeWeights(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [100];

  const base = Math.floor(100 / count);
  const remainder = 100 - base * count;
  const weights = Array.from({ length: count }, () => base);
  for (let i = 0; i < remainder; i++) {
    weights[i]! += 1;
  }
  return weights;
}

export function renumberItems(items: ContentItem[]): ContentItem[] {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}
