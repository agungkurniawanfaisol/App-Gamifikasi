import { QuestionFormat, QuestionSkill } from "@prisma/client";
import { ollamaChat } from "@/lib/ollama";
import {
  getFormatsForSkill,
  syncMcqCorrectAnswer,
  syncYesNoCorrectAnswer,
  type SubQuestion,
  validateSubQuestions,
} from "@/lib/sub-questions";

const ALL_SKILLS: QuestionSkill[] = [
  QuestionSkill.READING,
  QuestionSkill.LISTENING,
  QuestionSkill.WRITING,
  QuestionSkill.SPEAKING,
];

const DEFAULT_QUESTION_FORMATS: Record<QuestionSkill, QuestionFormat> = {
  [QuestionSkill.READING]: QuestionFormat.MULTIPLE_CHOICE,
  [QuestionSkill.LISTENING]: QuestionFormat.MULTIPLE_CHOICE,
  [QuestionSkill.WRITING]: QuestionFormat.ESSAY,
  [QuestionSkill.SPEAKING]: QuestionFormat.SPEECH_RECOGNITION,
};

export type AiMaterialDraft = {
  type: "material";
  title: string;
  content: string;
};

export type AiQuestionDraft = {
  type: "question";
  subQuestions: SubQuestion[];
  validationWarning?: string;
};

export type AiCopilotResult = AiMaterialDraft | AiQuestionDraft;

const COPILOT_SYSTEM_PROMPT = `You are an English learning content assistant for an admin authoring tool.
Respond in English only.
Output ONLY valid JSON — no markdown fences, no commentary before or after the JSON.`;

function buildSourceBlock(topic?: string, sourceText?: string): string {
  const parts: string[] = [];
  if (topic?.trim()) {
    parts.push(`Topic / learning objective:\n${topic.trim()}`);
  }
  if (sourceText?.trim()) {
    const excerpt =
      sourceText.length > 8_000
        ? `${sourceText.slice(0, 8_000)}…`
        : sourceText;
    parts.push(`Source material:\n${excerpt}`);
  }
  return parts.join("\n\n");
}

export function buildMaterialPrompt(topic?: string, sourceText?: string): string {
  const source = buildSourceBlock(topic, sourceText);
  return `${COPILOT_SYSTEM_PROMPT}

Create one learning material draft from the input below.

${source}

Return JSON with this exact shape:
{
  "title": "short descriptive title",
  "paragraphs": ["paragraph 1", "paragraph 2", "..."]
}

Guidelines:
- 3–6 clear paragraphs suitable for English learners
- Use simple, instructional language
- Do not include quiz questions in the material`;
}

export function buildQuestionPrompt(topic?: string, sourceText?: string): string {
  const source = buildSourceBlock(topic, sourceText);
  return `${COPILOT_SYSTEM_PROMPT}

Create one complete question item with exactly 4 sub-questions — one per skill: READING, LISTENING, WRITING, SPEAKING.
Each sub-question weightPercent must be 25 (total 100).

${source}

Return JSON with this exact shape:
{
  "subQuestions": [
    {
      "skill": "READING",
      "format": "MULTIPLE_CHOICE",
      "weightPercent": 25,
      "questionText": "...",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "exact text of the correct option",
      "explanation": "brief explanation"
    },
    {
      "skill": "LISTENING",
      "format": "MULTIPLE_CHOICE",
      "weightPercent": 25,
      "questionText": "Listening comprehension question (student will hear audio separately)",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "exact text of the correct option",
      "explanation": "brief explanation"
    },
    {
      "skill": "WRITING",
      "format": "ESSAY",
      "weightPercent": 25,
      "questionText": "Essay prompt",
      "essayRubric": "grading criteria in 2-4 sentences"
    },
    {
      "skill": "SPEAKING",
      "format": "SPEECH_RECOGNITION",
      "weightPercent": 25,
      "questionText": "Speaking prompt",
      "expectedSpeech": "the phrase or sentence the student should say"
    }
  ]
}

Rules:
- correctAnswer must exactly match one option string for MCQ sub-questions
- Do not include audioUrl (admin uploads audio for Listening later)
- All content in English`;
}

export function extractJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch?.[1]?.trim() ?? trimmed;

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in AI response");
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

export function paragraphsToTipTapJson(paragraphs: string[]): string {
  const content = paragraphs
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    }));

  return JSON.stringify({
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  });
}

function normalizeMcqOptions(options: unknown): string[] {
  if (!Array.isArray(options)) return ["", "", "", ""];
  const opts = options.map(String).filter((o) => o.trim());
  while (opts.length < 4) opts.push("");
  return opts.slice(0, 4);
}

function pickValidFormat(skill: QuestionSkill, format: unknown): QuestionFormat {
  const allowed = getFormatsForSkill(skill);
  const parsed = String(format ?? "") as QuestionFormat;
  if (allowed.includes(parsed)) return parsed;
  return DEFAULT_QUESTION_FORMATS[skill];
}

export function normalizeAiSubQuestions(raw: unknown): SubQuestion[] {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid question draft structure");
  }

  const subs = (raw as { subQuestions?: unknown }).subQuestions;
  if (!Array.isArray(subs) || subs.length === 0) {
    throw new Error("AI did not return sub-questions");
  }

  const bySkill = new Map<QuestionSkill, Record<string, unknown>>();
  for (const entry of subs) {
    if (!entry || typeof entry !== "object") continue;
    const skill = String((entry as { skill?: string }).skill ?? "") as QuestionSkill;
    if (ALL_SKILLS.includes(skill)) {
      bySkill.set(skill, entry as Record<string, unknown>);
    }
  }

  return ALL_SKILLS.map((skill, index) => {
    const entry = bySkill.get(skill) ?? {};
    const format = pickValidFormat(skill, entry.format);
    const questionText = String(entry.questionText ?? "").trim();
    const weightPercent = Number(entry.weightPercent ?? 25);

    const base: SubQuestion = {
      id: crypto.randomUUID(),
      order: index,
      skill,
      format,
      weightPercent: Number.isFinite(weightPercent) ? weightPercent : 25,
      questionText,
    };

    if (format === QuestionFormat.MULTIPLE_CHOICE) {
      const options = normalizeMcqOptions(entry.options);
      return {
        ...base,
        options,
        correctAnswer: syncMcqCorrectAnswer(
          options,
          String(entry.correctAnswer ?? "")
        ),
        explanation: entry.explanation ? String(entry.explanation) : undefined,
      };
    }

    if (format === QuestionFormat.YES_NO) {
      return {
        ...base,
        options: ["Yes", "No"],
        correctAnswer: syncYesNoCorrectAnswer(String(entry.correctAnswer ?? "")),
        explanation: entry.explanation ? String(entry.explanation) : undefined,
      };
    }

    if (format === QuestionFormat.ESSAY) {
      return {
        ...base,
        essayRubric: String(entry.essayRubric ?? "").trim() || undefined,
      };
    }

    if (format === QuestionFormat.SPEECH_RECOGNITION) {
      return {
        ...base,
        expectedSpeech: String(entry.expectedSpeech ?? "").trim() || undefined,
      };
    }

    return base;
  });
}

export function parseMaterialDraft(raw: unknown): AiMaterialDraft {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid material draft structure");
  }
  const obj = raw as { title?: unknown; paragraphs?: unknown; content?: unknown };
  const title = String(obj.title ?? "New Material").trim() || "New Material";

  if (Array.isArray(obj.paragraphs)) {
    const paragraphs = obj.paragraphs.map(String).filter((p) => p.trim());
    return {
      type: "material",
      title,
      content: paragraphsToTipTapJson(paragraphs),
    };
  }

  if (typeof obj.content === "string" && obj.content.trim()) {
    return { type: "material", title, content: obj.content.trim() };
  }

  throw new Error("AI material draft is missing paragraphs");
}

export async function callOllamaForJson(prompt: string): Promise<unknown> {
  const response = await ollamaChat(
    [
      { role: "system", content: COPILOT_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    {
      chatOptions: {
        num_predict: 4096,
        num_ctx: 8192,
        temperature: 0.2,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Ollama error ${response.status}`);
  }

  const data = (await response.json()) as {
    message?: { content?: string };
  };
  const content = data.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from AI");
  }

  return extractJsonFromText(content);
}

export async function generateMaterialDraft(
  topic?: string,
  sourceText?: string
): Promise<AiMaterialDraft> {
  const raw = await callOllamaForJson(buildMaterialPrompt(topic, sourceText));
  return parseMaterialDraft(raw);
}

export async function generateQuestionDraft(
  topic?: string,
  sourceText?: string
): Promise<AiQuestionDraft> {
  const raw = await callOllamaForJson(buildQuestionPrompt(topic, sourceText));
  const subQuestions = normalizeAiSubQuestions(raw);
  const validationError = validateSubQuestions(subQuestions);

  return {
    type: "question",
    subQuestions,
    validationWarning: validationError ?? undefined,
  };
}
