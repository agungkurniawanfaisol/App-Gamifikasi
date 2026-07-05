import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth-helpers";
import { resolveAssistantKnowledge } from "@/lib/assistant-knowledge";
import { createPlainTextStream } from "@/lib/instant-chat-stream";
import { labels } from "@/lib/labels";
import {
  buildBraderSystemPrompt,
  buildLearnChatSystemPrompt,
  CHAT_HISTORY_LIMIT,
  getOllamaKeepAlive,
  OLLAMA_CHAT_OPTIONS,
  trimLearnStepContent,
  type LearnChatContextInput,
} from "@/lib/ollama";
import { awardDiscussionMilestone } from "@/lib/point-service";
import {
  recordChallengeEvent,
  type ChallengeCompletionResult,
} from "@/lib/challenge-service";
import { ChatRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { startOfWibDay } from "@/lib/chat-day";

type ChatRequestBody = {
  message?: string;
  groupId?: number;
  context?: Omit<LearnChatContextInput, "groupTitle" | "levelName"> & {
    groupTitle?: string;
    levelName?: string;
  };
};

type GamificationResult = {
  discussionAward: Awaited<ReturnType<typeof awardDiscussionMilestone>>;
  challengeCompletions: ChallengeCompletionResult[];
};

async function resolveChatGamification(
  userId: number,
  groupId: number | null
): Promise<GamificationResult> {
  const [discussionAward, challengeCompletions] = await Promise.all([
    awardDiscussionMilestone(userId, groupId),
    recordChallengeEvent(userId, { kind: "CHAT_MESSAGE" }),
  ]);

  if (discussionAward.awarded > 0 || challengeCompletions.length > 0) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/chat");
    revalidatePath("/dashboard/challenges");
    if (groupId != null) {
      revalidatePath("/dashboard/learn");
    }
  }

  return { discussionAward, challengeCompletions };
}

function buildResponseHeaders({
  discussionAward,
  challengeCompletions,
}: GamificationResult): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked",
  };

  if (discussionAward.awarded > 0) {
    headers["X-Points-Awarded"] = String(discussionAward.awarded);
  }

  if (challengeCompletions.length > 0) {
    headers["X-Challenge-Completions"] = JSON.stringify(challengeCompletions);
  }

  return headers;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = getUserId(session);
  const body = (await request.json()) as ChatRequestBody;
  const message = body.message?.trim();
  if (!message) {
    return new Response("Message required", { status: 400 });
  }

  const groupId = body.groupId ?? null;

  const [knowledge, group] = await Promise.all([
    resolveAssistantKnowledge(message),
    groupId != null
      ? prisma.learningGroup.findFirst({
          where: { id: groupId, isPublished: true },
          include: { level: { select: { name: true } } },
        })
      : Promise.resolve(null),
  ]);

  if (groupId != null && !group) {
    return new Response("Group not found", { status: 404 });
  }

  let systemPrompt = buildBraderSystemPrompt(knowledge.referenceFacts);

  if (group && body.context?.phase && body.context.stepLabel) {
    systemPrompt = buildLearnChatSystemPrompt(
      {
        groupTitle: body.context.groupTitle ?? group.title,
        levelName: body.context.levelName ?? group.level.name,
        phase: body.context.phase,
        stepLabel: body.context.stepLabel,
        stepContent: trimLearnStepContent(body.context.stepContent),
      },
      knowledge.referenceFacts
    );
  }

  if (knowledge.instantAnswer) {
    const instantAnswer = knowledge.instantAnswer;

    const [, gamification] = await Promise.all([
      prisma.$transaction(async (tx) => {
        await tx.chatHistory.create({
          data: { userId, groupId, role: ChatRole.USER, message },
        });
        await tx.chatHistory.create({
          data: {
            userId,
            groupId,
            role: ChatRole.ASSISTANT,
            message: instantAnswer,
          },
        });
      }),
      resolveChatGamification(userId, groupId),
    ]);

    return new Response(createPlainTextStream(instantAnswer), {
      headers: buildResponseHeaders(gamification),
    });
  }

  await prisma.chatHistory.create({
    data: { userId, groupId, role: ChatRole.USER, message },
  });

  const [historyRows, gamification] = await Promise.all([
    prisma.chatHistory.findMany({
      where: {
        userId,
        createdAt: { gte: startOfWibDay() },
        ...(groupId != null ? { groupId } : { groupId: null }),
      },
      orderBy: { createdAt: "desc" },
      take: CHAT_HISTORY_LIMIT,
      select: { role: true, message: true },
    }),
    resolveChatGamification(userId, groupId),
  ]);

  const messages = [...historyRows].reverse().map((h) => ({
    role: h.role === ChatRole.USER ? ("user" as const) : ("assistant" as const),
    content: h.message,
  }));

  let baseUrl: string;
  let model: string;
  try {
    baseUrl = process.env.OLLAMA_BASE_URL!;
    model = process.env.OLLAMA_MODEL!;
    if (!baseUrl || !model) {
      throw new Error("Ollama not configured");
    }
  } catch {
    const fallback = labels.errors.ollamaUnavailable;
    await prisma.chatHistory.create({
      data: {
        userId,
        groupId,
        role: ChatRole.ASSISTANT,
        message: fallback,
      },
    });
    return new Response(createPlainTextStream(fallback), {
      headers: buildResponseHeaders(gamification),
    });
  }

  let ollamaRes: Response;
  try {
    const { fetchOllamaChatStream } = await import("@/lib/ollama-health");
    ollamaRes = await fetchOllamaChatStream(baseUrl, {
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      keep_alive: getOllamaKeepAlive(),
      options: OLLAMA_CHAT_OPTIONS,
    });
  } catch (error) {
    console.error("[api/ai/chat] Ollama fetch failed:", error);
    const fallback = labels.errors.ollamaUnavailable;
    await prisma.chatHistory.create({
      data: {
        userId,
        groupId,
        role: ChatRole.ASSISTANT,
        message: fallback,
      },
    });
    return new Response(createPlainTextStream(fallback), {
      headers: buildResponseHeaders(gamification),
    });
  }

  if (!ollamaRes.ok || !ollamaRes.body) {
    const errorBody = await ollamaRes.text().catch(() => "");
    console.error(
      "[api/ai/chat] Ollama upstream error:",
      ollamaRes.status,
      errorBody.slice(0, 500)
    );
    const fallback = labels.errors.ollamaUnavailable;
    await prisma.chatHistory.create({
      data: {
        userId,
        groupId,
        role: ChatRole.ASSISTANT,
        message: fallback,
      },
    });
    return new Response(createPlainTextStream(fallback), {
      headers: buildResponseHeaders(gamification),
    });
  }

  let fullAssistant = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = ollamaRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
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
              if (chunk.message?.content) {
                fullAssistant += chunk.message.content;
                controller.enqueue(
                  new TextEncoder().encode(chunk.message.content)
                );
              }
            } catch {
              /* skip */
            }
          }
        }
      } finally {
        if (fullAssistant.trim()) {
          await prisma.chatHistory.create({
            data: {
              userId,
              groupId,
              role: ChatRole.ASSISTANT,
              message: fullAssistant.trim(),
            },
          });
        }
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: buildResponseHeaders(gamification) });
}
