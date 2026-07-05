import { NextRequest, NextResponse } from "next/server";
import {
  handleExternalApiOptions,
  withExternalApiAuth,
} from "@/lib/external-api";
import {
  chatRequestSchema,
  parseJsonBody,
  MAX_BODY_BYTES,
} from "@/lib/external-api-schemas";
import { resolveAssistantKnowledge } from "@/lib/assistant-knowledge";
import {
  createOllamaStyleJson,
  createOllamaStyleStream,
} from "@/lib/instant-chat-stream";
import { buildBraderSystemPrompt, ollamaChat } from "@/lib/ollama";
import { labels } from "@/lib/labels";
import { corsHeaders } from "@/lib/external-api-cors";

export async function OPTIONS(request: NextRequest) {
  return handleExternalApiOptions(request, null);
}

export async function POST(request: NextRequest) {
  return withExternalApiAuth(request, "chat", "/api/v1/chat", async ({ corsOrigin }) => {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = parseJsonBody(chatRequestSchema, body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { messages, stream, model } = parsed.data;
    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user")?.content;

    const knowledge = lastUserMessage
      ? await resolveAssistantKnowledge(lastUserMessage).catch(() => ({
          instantAnswer: null,
          referenceFacts: null,
          matches: [],
        }))
      : { instantAnswer: null, referenceFacts: null, matches: [] };

    if (knowledge.instantAnswer) {
      if (stream) {
        return new NextResponse(createOllamaStyleStream(knowledge.instantAnswer), {
          status: 200,
          headers: {
            "Content-Type": "application/x-ndjson",
            ...corsHeaders(corsOrigin),
          },
        });
      }

      return NextResponse.json(createOllamaStyleJson(knowledge.instantAnswer), {
        headers: corsHeaders(corsOrigin),
      });
    }

    const hasSystem = messages.some((m) => m.role === "system");
    const braderSystem = buildBraderSystemPrompt(knowledge.referenceFacts);
    const ollamaMessages = hasSystem
      ? messages
      : [{ role: "system" as const, content: braderSystem }, ...messages];

    if (hasSystem && knowledge.referenceFacts) {
      const systemIndex = ollamaMessages.findIndex((m) => m.role === "system");
      if (systemIndex >= 0) {
        const existing = ollamaMessages[systemIndex]!.content;
        ollamaMessages[systemIndex] = {
          role: "system",
          content: `${existing}\n\nReference facts (prefer these over guessing):\n${knowledge.referenceFacts}`,
        };
      }
    }

    let upstream: Response;
    try {
      const { warmOllamaModel } = await import("@/lib/ollama-health");
      await warmOllamaModel();
      upstream = await ollamaChat(ollamaMessages, { model, stream });
    } catch (error) {
      console.error("[api/v1/chat] Ollama request failed:", error);
      return NextResponse.json(
        { error: labels.errors.ollamaUnavailable },
        { status: 502 }
      );
    }

    if (!upstream.ok) {
      const errorBody = await upstream.text().catch(() => "");
      console.error("[api/v1/chat] Ollama upstream error:", upstream.status, errorBody);
      return NextResponse.json(
        { error: labels.errors.ollamaUnavailable },
        { status: 502 }
      );
    }

    if (stream && upstream.body) {
      return new NextResponse(upstream.body, {
        status: 200,
        headers: {
          "Content-Type": "application/x-ndjson",
          ...corsHeaders(corsOrigin),
        },
      });
    }

    let data: unknown;
    try {
      data = await upstream.json();
    } catch (error) {
      console.error("[api/v1/chat] Invalid Ollama JSON:", error);
      return NextResponse.json(
        { error: labels.errors.ollamaUnavailable },
        { status: 502 }
      );
    }
    return NextResponse.json(data);
  });
}
