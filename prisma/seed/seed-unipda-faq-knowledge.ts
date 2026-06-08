import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";

type ExportEntry = {
  slug: string;
  keywords: string[];
  questionEn: string;
  questionId: string;
  answerEn: string;
  answerId: string;
  priority: number;
};

const DATA_FILE = join(__dirname, "data", "unipda-faq-export.json");

function loadEntries(): ExportEntry[] {
  if (!existsSync(DATA_FILE)) {
    console.warn(`⚠️  Skip unipda FAQ import — file not found: ${DATA_FILE}`);
    console.warn("   Run in Ai-Unipda-App: php artisan faq:export-gamifikasi");
    return [];
  }

  const raw = readFileSync(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as ExportEntry[];

  if (!Array.isArray(parsed)) {
    throw new Error("unipda-faq-export.json must be a JSON array");
  }

  return parsed;
}

export async function seedUnipdaFaqKnowledge(prisma: PrismaClient) {
  const entries = loadEntries();
  if (entries.length === 0) return;

  let imported = 0;
  for (const entry of entries) {
    if (!entry.slug?.trim() || !entry.questionId?.trim()) continue;

    await prisma.assistantKnowledge.upsert({
      where: { slug: entry.slug },
      create: {
        slug: entry.slug,
        keywords: entry.keywords ?? [],
        questionEn: entry.questionEn || entry.questionId,
        questionId: entry.questionId,
        answerEn: entry.answerEn || entry.answerId,
        answerId: entry.answerId,
        priority: entry.priority ?? 70,
        isPublished: true,
      },
      update: {
        keywords: entry.keywords ?? [],
        questionEn: entry.questionEn || entry.questionId,
        questionId: entry.questionId,
        answerEn: entry.answerEn || entry.answerId,
        answerId: entry.answerId,
        priority: entry.priority ?? 70,
        isPublished: true,
      },
    });
    imported++;
  }

  console.log(`  Assistant knowledge (UNIPDA FAQ): ${imported} entries`);
}
