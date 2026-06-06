import type {
  ContentItemType,
  QuestionFormat,
  QuestionSkill,
} from "@prisma/client";
import type { SubQuestion } from "@/lib/sub-questions";
import {
  getSubQuestionSummary,
  getSubQuestionsFromItem,
} from "@/lib/sub-questions";

export type ContentItemPayload = {
  id: number;
  groupId: number;
  type: ContentItemType;
  order: number;
  title: string | null;
  content: string | null;
  questionText: string | null;
  skill: QuestionSkill | null;
  format: QuestionFormat | null;
  options: string[] | null;
  correctAnswer: string | null;
  expectedSpeech: string | null;
  audioUrl: string | null;
  explanation: string | null;
  essayRubric: string | null;
  subQuestions?: SubQuestion[];
};

export function parseOptions(options: unknown): string[] {
  if (!options) return [];
  if (Array.isArray(options)) return options.map(String);
  return [];
}

export type ContentItemSummary = Pick<
  ContentItemPayload,
  "id" | "type" | "title" | "skill" | "format" | "questionText"
> & {
  subQuestions?: SubQuestion[];
};

export function getContentItemLabel(item: ContentItemSummary): string {
  if (item.type === "MATERIAL") {
    return item.title ?? "Material";
  }
  if (item.subQuestions && item.subQuestions.length > 0) {
    return getSubQuestionSummary(item.subQuestions);
  }
  const skill = getSkillLabel(item.skill);
  const format = getFormatLabel(item.format);
  if (skill && format) return `${skill} · ${format}`;
  return skill || format || "Question";
}

export function getContentItemDescription(item: ContentItemSummary): string {
  if (item.type === "MATERIAL") {
    return item.title?.trim() || "Untitled material";
  }
  const firstSub = item.subQuestions?.[0];
  if (firstSub?.questionText.trim()) {
    return firstSub.questionText.trim();
  }
  return item.questionText?.trim() || getContentItemLabel(item);
}

export { getSubQuestionsFromItem };

export function getSkillLabel(skill: QuestionSkill | null): string {
  switch (skill) {
    case "SPEAKING":
      return "Speaking";
    case "READING":
      return "Reading";
    case "WRITING":
      return "Writing";
    case "LISTENING":
      return "Listening";
    default:
      return "";
  }
}

export function getFormatLabel(format: QuestionFormat | null): string {
  switch (format) {
    case "MULTIPLE_CHOICE":
      return "Multiple Choice";
    case "YES_NO":
      return "Yes/No";
    case "ESSAY":
      return "Essay";
    case "SPEECH_RECOGNITION":
      return "Speech Recognition";
    default:
      return "";
  }
}

type TipTapNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, string>;
  content?: TipTapNode[];
  marks?: { type: string; attrs?: Record<string, string> }[];
};

export function tiptapJsonToHtml(doc: string | null): string {
  if (!doc) return "";
  try {
    const parsed = JSON.parse(doc) as TipTapNode;
    return renderNode(parsed);
  } catch {
    return doc;
  }
}

function renderNode(node: TipTapNode): string {
  if (!node) return "";
  if (node.type === "text") {
    let text = escapeHtml(node.text ?? "");
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") text = `<strong>${text}</strong>`;
      if (mark.type === "italic") text = `<em>${text}</em>`;
      if (mark.type === "link") {
        const href = mark.attrs?.href ?? "#";
        text = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="text-primary underline">${text}</a>`;
      }
    }
    return text;
  }

  const inner = (node.content ?? []).map(renderNode).join("");

  switch (node.type) {
    case "doc":
      return inner;
    case "paragraph":
      return `<p class="mb-3">${inner || "<br/>"}</p>`;
    case "heading": {
      const level = node.attrs?.level ?? "2";
      return `<h${level} class="mb-2 font-semibold">${inner}</h${level}>`;
    }
    case "bulletList":
      return `<ul class="mb-3 list-disc pl-5">${inner}</ul>`;
    case "orderedList":
      return `<ol class="mb-3 list-decimal pl-5">${inner}</ol>`;
    case "listItem":
      return `<li>${inner}</li>`;
    case "image":
      return `<img src="${escapeHtml(node.attrs?.src ?? "")}" alt="${escapeHtml(node.attrs?.alt ?? "")}" class="my-3 max-w-full rounded-md" />`;
    case "blockquote":
      return `<blockquote class="mb-3 border-l-4 border-border pl-4 italic">${inner}</blockquote>`;
    case "codeBlock":
      return `<pre class="mb-3 overflow-x-auto rounded-md bg-muted p-3 text-sm"><code>${inner}</code></pre>`;
    case "hardBreak":
      return "<br/>";
    default:
      return inner;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const AI_CONTEXT_MAX_LENGTH = 1500;

export function getStepContentExcerpt(content: string | null): string | undefined {
  if (!content) return undefined;
  const plain = stripHtml(tiptapJsonToHtml(content));
  if (!plain) return undefined;
  if (plain.length <= AI_CONTEXT_MAX_LENGTH) return plain;
  return `${plain.slice(0, AI_CONTEXT_MAX_LENGTH)}…`;
}

export function getStepContextForAi(
  item: ContentItemPayload | null,
  phase: "pretest" | "content" | "posttest",
  options?: {
    assessmentQuestionText?: string | null;
  }
): { stepLabel: string; stepContent?: string } {
  if (phase === "pretest") {
    return {
      stepLabel: options?.assessmentQuestionText
        ? `Pretest: ${options.assessmentQuestionText}`
        : "Pretest",
    };
  }
  if (phase === "posttest") {
    return {
      stepLabel: options?.assessmentQuestionText
        ? `Posttest: ${options.assessmentQuestionText}`
        : "Posttest",
    };
  }
  if (!item) {
    return { stepLabel: "Materials & Questions" };
  }
  if (item.type === "MATERIAL") {
    return {
      stepLabel: item.title ? `Material: ${item.title}` : getContentItemLabel(item),
      stepContent: getStepContentExcerpt(item.content),
    };
  }
  const description = getContentItemDescription(item);
  return {
    stepLabel: `Question: ${description}`,
    stepContent: description.length > 200 ? description.slice(0, 200) : description,
  };
}

export const SPEECH_PASS_THRESHOLD = 90;
