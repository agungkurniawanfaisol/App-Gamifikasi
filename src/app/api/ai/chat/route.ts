import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth-helpers";
import { resolveAssistantKnowledge } from "@/lib/assistant-knowledge";
import { createPlainTextStream } from "@/lib/instant-chat-stream";
import {
  buildBraderSystemPrompt,
  buildLearnChatSystemPrompt,
  getOllamaKeepAlive,
  type LearnChatContextInput,
} from "@/lib/ollama";
import { awardDiscussionMilestone } from "@/lib/point-service";
import { recordChallengeEvent } from "@/lib/challenge-service";
import { ChatRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

type ChatRequestBody = {
  message?: string;
  groupId?: number;
  context?: Omit<LearnChatContextInput, "groupTitle" | "levelName"> & {
    groupTitle?: string;
    levelName?: string;
  };
};

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
  const knowledge = await resolveAssistantKnowledge(message);

  let systemPrompt = buildBraderSystemPrompt(knowledge.referenceFacts);

  if (groupId != null) {
    const group = await prisma.learningGroup.findFirst({
      where: { id: groupId, isPublished: true },
      include: { level: { select: { name: true } } },
    });
    if (!group) {
      return new Response("Group not found", { status: 404 });
    }

    if (body.context?.phase && body.context.stepLabel) {
      systemPrompt = buildLearnChatSystemPrompt(
        {
          groupTitle: body.context.groupTitle ?? group.title,
          levelName: body.context.levelName ?? group.level.name,
          phase: body.context.phase,
          stepLabel: body.context.stepLabel,
          stepContent: body.context.stepContent,
        },
        knowledge.referenceFacts
      );
    }
  }

  await prisma.chatHistory.create({
    data: {
      userId,
      groupId,
      role: ChatRole.USER,
      message,
    },
  });

  const discussionAward = await awardDiscussionMilestone(userId, groupId);
  const challengeCompletions = await recordChallengeEvent(userId, {
    kind: "CHAT_MESSAGE",
  });
  if (discussionAward.awarded > 0 || challengeCompletions.length > 0) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/chat");
    revalidatePath("/dashboard/challenges");
    if (groupId != null) {
      revalidatePath(`/dashboard/learn`);
    }
  }

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

  if (knowledge.instantAnswer) {
    const instantAnswer = knowledge.instantAnswer;
    await prisma.chatHistory.create({
      data: {
        userId,
        groupId,
        role: ChatRole.ASSISTANT,
        message: instantAnswer,
      },
    });

    return new Response(createPlainTextStream(instantAnswer), { headers });
  }

  const history = await prisma.chatHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const messages = history.map((h) => ({
    role: h.role === ChatRole.USER ? ("user" as const) : ("assistant" as const),
    content: h.message,
  }));

  const { baseUrl, model } = (() => {
    try {
      const baseUrl = process.env.OLLAMA_BASE_URL!;
      const model = process.env.OLLAMA_MODEL!;
      return { baseUrl, model };
    } catch {
      throw new Error("Ollama not configured");
    }
  })();

  const ollamaRes = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      keep_alive: getOllamaKeepAlive(),
      options: { num_predict: 256, temperature: 0.3 },
    }),
  });

  if (!ollamaRes.ok || !ollamaRes.body) {
    return new Response("Ollama error", { status: 502 });
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

  return new Response(stream, { headers });
}
