import { NextRequest, NextResponse } from "next/server";
import {
  handleExternalApiOptions,
  withExternalApiAuth,
} from "@/lib/external-api";
import { ollamaListModels } from "@/lib/ollama";
import { labels } from "@/lib/labels";

export async function OPTIONS(request: NextRequest) {
  return handleExternalApiOptions(request, null);
}

export async function GET(request: NextRequest) {
  return withExternalApiAuth(request, "models", "/api/v1/models", async ({ corsOrigin }) => {
    const upstream = await ollamaListModels();
    if (!upstream.ok) {
      return NextResponse.json(
        { error: labels.errors.serverError },
        { status: 502 }
      );
    }
    const data = await upstream.json();
    return NextResponse.json(data, { headers: corsOrigin ? {} : undefined });
  });
}
