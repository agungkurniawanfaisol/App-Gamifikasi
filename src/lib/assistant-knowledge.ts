import { prisma } from "@/lib/prisma";

export type AssistantKnowledgeEntry = {
  id: number;
  slug: string;
  keywords: string[];
  questionEn: string;
  questionId: string | null;
  answerEn: string;
  answerId: string | null;
  priority: number;
};

export type KnowledgeMatch = {
  entry: AssistantKnowledgeEntry;
  score: number;
};

export type AssistantKnowledgeResult = {
  instantAnswer: string | null;
  referenceFacts: string | null;
  matches: KnowledgeMatch[];
};

const INSTANT_THRESHOLD = 0.65;
const REFERENCE_MIN_SCORE = 0.25;
const MAX_REFERENCE_ENTRIES = 3;

const INDONESIAN_HINTS = [
  "siapa",
  "apa",
  "kamu",
  "nama",
  "dimana",
  "bagaimana",
  "mengapa",
  "kenapa",
  "tolong",
  "terima kasih",
  "unipda",
  "kampus",
  "mahasiswa",
  "dikembangkan",
  "panggil",
];

function parseKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectQueryLanguage(query: string): "id" | "en" {
  const normalized = normalizeQuery(query);
  const words = normalized.split(" ");
  const indonesianHits = words.filter((word) =>
    INDONESIAN_HINTS.some((hint) => word === hint || word.startsWith(hint))
  ).length;
  if (indonesianHits >= 1) return "id";
  return "en";
}

export function pickKnowledgeAnswer(
  entry: Pick<AssistantKnowledgeEntry, "answerEn" | "answerId">,
  language: "id" | "en"
): string {
  if (language === "id" && entry.answerId?.trim()) {
    return entry.answerId.trim();
  }
  return entry.answerEn.trim();
}

function keywordMatchesQuery(normalizedKeyword: string, normalizedQuery: string): boolean {
  if (!normalizedKeyword) return false;
  if (normalizedQuery.includes(normalizedKeyword)) return true;
  if (!normalizedKeyword.includes(" ")) {
    return normalizedQuery.split(" ").includes(normalizedKeyword);
  }
  return false;
}

function scoreEntry(
  normalizedQuery: string,
  entry: AssistantKnowledgeEntry
): number {
  let score = 0;

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalizeQuery(keyword);
    if (keywordMatchesQuery(normalizedKeyword, normalizedQuery)) {
      score += normalizedKeyword.includes(" ") ? 0.45 : 0.25;
    }
  }

  const questions = [entry.questionEn, entry.questionId].filter(Boolean) as string[];
  for (const question of questions) {
    const normalizedQuestion = normalizeQuery(question);
    if (!normalizedQuestion) continue;
    if (
      normalizedQuery.includes(normalizedQuestion) ||
      normalizedQuestion.includes(normalizedQuery)
    ) {
      score += 0.4;
    }
  }

  score += Math.min(entry.priority / 500, 0.1);
  return Math.min(score, 1);
}

function formatReferenceFacts(matches: KnowledgeMatch[], language: "id" | "en"): string {
  return matches
    .map(({ entry }) => {
      const question =
        language === "id" && entry.questionId
          ? entry.questionId
          : entry.questionEn;
      const answer = pickKnowledgeAnswer(entry, language);
      return `- Q: ${question}\n  A: ${answer}`;
    })
    .join("\n");
}

export async function isAssistantKnowledgeTableReady(): Promise<boolean> {
  try {
    await prisma.assistantKnowledge.count();
    return true;
  } catch {
    return false;
  }
}

export async function listPublishedAssistantKnowledge(): Promise<
  AssistantKnowledgeEntry[]
> {
  if (!(await isAssistantKnowledgeTableReady())) return [];

  const rows = await prisma.assistantKnowledge.findMany({
    where: { isPublished: true },
    orderBy: [{ priority: "desc" }, { id: "asc" }],
    select: {
      id: true,
      slug: true,
      keywords: true,
      questionEn: true,
      questionId: true,
      answerEn: true,
      answerId: true,
      priority: true,
    },
  });

  return rows.map((row) => ({
    ...row,
    keywords: parseKeywords(row.keywords),
  }));
}

export function matchAssistantKnowledge(
  query: string,
  entries: AssistantKnowledgeEntry[]
): AssistantKnowledgeResult {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return { instantAnswer: null, referenceFacts: null, matches: [] };
  }

  const language = detectQueryLanguage(query);
  const matches = entries
    .map((entry) => ({ entry, score: scoreEntry(normalizedQuery, entry) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.entry.priority - a.entry.priority);

  if (matches.length === 0) {
    return { instantAnswer: null, referenceFacts: null, matches: [] };
  }

  const top = matches[0]!;
  if (top.score >= INSTANT_THRESHOLD) {
    return {
      instantAnswer: pickKnowledgeAnswer(top.entry, language),
      referenceFacts: null,
      matches,
    };
  }

  const referenceMatches = matches
    .filter(({ score }) => score >= REFERENCE_MIN_SCORE)
    .slice(0, MAX_REFERENCE_ENTRIES);

  return {
    instantAnswer: null,
    referenceFacts:
      referenceMatches.length > 0
        ? formatReferenceFacts(referenceMatches, language)
        : null,
    matches,
  };
}

export async function resolveAssistantKnowledge(
  query: string
): Promise<AssistantKnowledgeResult> {
  const entries = await listPublishedAssistantKnowledge();
  return matchAssistantKnowledge(query, entries);
}
