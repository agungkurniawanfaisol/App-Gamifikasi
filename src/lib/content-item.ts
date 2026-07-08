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
import type { MaterialAttachment } from "@/lib/material-attachments";
import { sanitizeFontSize } from "@/lib/tiptap/font-size";
import { sanitizeColor } from "@/lib/tiptap/text-color";

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
  attachments?: MaterialAttachment[];
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
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

const SAFE_ALIGN = new Set(["left", "center", "right", "justify"]);

function styleAttr(styles: string[]): string {
  if (styles.length === 0) return "";
  return ` style="${escapeHtml(styles.join("; "))}"`;
}

function textAlignStyle(attrs?: Record<string, unknown>): string[] {
  const align = typeof attrs?.textAlign === "string" ? attrs.textAlign : "";
  if (!SAFE_ALIGN.has(align) || align === "left") return [];
  return [`text-align: ${align}`];
}

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
    const textStyleMarks = (node.marks ?? []).filter((mark) => mark.type === "textStyle");
    const textStyleAttrs = textStyleMarks.reduce<Record<string, unknown>>(
      (acc, mark) => ({ ...acc, ...mark.attrs }),
      {}
    );
    const textStyleStyles: string[] = [];
    const size = sanitizeFontSize(
      typeof textStyleAttrs.fontSize === "string" ? textStyleAttrs.fontSize : null
    );
    const color = sanitizeColor(
      typeof textStyleAttrs.color === "string" ? textStyleAttrs.color : null
    );
    if (size) textStyleStyles.push(`font-size: ${size}`);
    if (color) textStyleStyles.push(`color: ${color}`);

    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") text = `<strong>${text}</strong>`;
      if (mark.type === "italic") text = `<em>${text}</em>`;
      if (mark.type === "strike") text = `<s>${text}</s>`;
      if (mark.type === "underline") text = `<u>${text}</u>`;
      if (mark.type === "code") {
        text = `<code class="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">${text}</code>`;
      }
      if (mark.type === "highlight") {
        const highlightColor =
          sanitizeColor(
            typeof mark.attrs?.color === "string" ? mark.attrs.color : null
          ) ?? "#fef08a";
        text = `<mark style="background-color: ${escapeHtml(highlightColor)}">${text}</mark>`;
      }
      if (mark.type === "link") {
        const href =
          typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
        text = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="text-primary underline">${text}</a>`;
      }
    }

    if (textStyleStyles.length > 0) {
      text = `<span style="${escapeHtml(textStyleStyles.join("; "))}">${text}</span>`;
    }

    return text;
  }

  const inner = (node.content ?? []).map(renderNode).join("");
  const alignStyles = textAlignStyle(node.attrs);

  switch (node.type) {
    case "doc":
      return inner;
    case "paragraph":
      return `<p class="mb-3"${styleAttr(alignStyles)}>${inner || "<br/>"}</p>`;
    case "heading": {
      const levelRaw = node.attrs?.level;
      const level =
        typeof levelRaw === "number" || typeof levelRaw === "string"
          ? String(levelRaw)
          : "2";
      const safeLevel = ["1", "2", "3", "4", "5", "6"].includes(level)
        ? level
        : "2";
      return `<h${safeLevel} class="mb-2 font-semibold"${styleAttr(alignStyles)}>${inner}</h${safeLevel}>`;
    }
    case "bulletList":
      return `<ul class="mb-3 list-disc pl-6">${inner}</ul>`;
    case "orderedList":
      return `<ol class="mb-3 list-decimal pl-6">${inner}</ol>`;
    case "listItem":
      return `<li>${inner}</li>`;
    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="my-3 max-w-full rounded-md" />`;
    }
    case "blockquote":
      return `<blockquote class="mb-3 border-l-4 border-border pl-4 italic"${styleAttr(alignStyles)}>${inner}</blockquote>`;
    case "codeBlock":
      return `<pre class="mb-3 overflow-x-auto rounded-md bg-muted p-3 text-sm"><code>${inner}</code></pre>`;
    case "hardBreak":
      return "<br/>";
    case "horizontalRule":
      return '<hr class="my-4 border-border" />';
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
