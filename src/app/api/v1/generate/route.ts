import { NextRequest, NextResponse } from "next/server";
import {
  handleExternalApiOptions,
  withExternalApiAuth,
} from "@/lib/external-api";
import {
  generateRequestSchema,
  parseJsonBody,
  MAX_BODY_BYTES,
} from "@/lib/external-api-schemas";
import { ollamaGenerate } from "@/lib/ollama";
import { labels } from "@/lib/labels";
import { corsHeaders } from "@/lib/external-api-cors";

export async function OPTIONS(request: NextRequest) {
  return handleExternalApiOptions(request, null);
}

export async function POST(request: NextRequest) {
  return withExternalApiAuth(
    request,
    "generate",
    "/api/v1/generate",
    async ({ corsOrigin }) => {
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

      const parsed = parseJsonBody(generateRequestSchema, body);
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }

      const { prompt, stream, model } = parsed.data;

      let upstream: Response;
      try {
        upstream = await ollamaGenerate(prompt, { model, stream });
      } catch (error) {
        console.error("[api/v1/generate] Ollama request failed:", error);
        return NextResponse.json(
          { error: labels.errors.ollamaUnavailable },
          { status: 502 }
        );
      }

      if (!upstream.ok) {
        console.error("[api/v1/generate] Ollama upstream error:", upstream.status);
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

      const data = await upstream.json();
      return NextResponse.json(data);
    }
  );
}
