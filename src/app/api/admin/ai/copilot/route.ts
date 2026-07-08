import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import {
  generateMaterialDraft,
  generateQuestionDraft,
} from "@/lib/ai-copilot";
import { labels } from "@/lib/labels";

type CopilotBody = {
  type?: "material" | "question" | "mcq";
  topic?: string;
  sourceText?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CopilotBody;
  try {
    body = (await request.json()) as CopilotBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const topic = body.topic?.trim();
  const sourceText = body.sourceText?.trim();
  if (!topic && !sourceText) {
    return NextResponse.json(
      { error: labels.admin.aiCopilotSourceRequired },
      { status: 400 }
    );
  }

  const type = body.type === "mcq" ? "question" : body.type;
  if (type !== "material" && type !== "question") {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  try {
    if (type === "material") {
      const draft = await generateMaterialDraft(topic, sourceText);
      return NextResponse.json(draft);
    }

    const draft = await generateQuestionDraft(topic, sourceText);
    return NextResponse.json(draft);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : labels.admin.aiCopilotError;
    if (
      message.includes("ECONNREFUSED") ||
      message.includes("fetch failed") ||
      message.includes("OLLAMA")
    ) {
      return NextResponse.json(
        { error: labels.admin.aiCopilotOllamaUnavailable },
        { status: 503 }
      );
    }
    console.error("[api/admin/ai/copilot]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
