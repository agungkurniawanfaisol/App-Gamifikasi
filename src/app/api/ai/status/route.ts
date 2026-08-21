import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOllamaStatus } from "@/lib/ollama-health";

/**
 * Authenticated AI health check for UI badges and admin diagnostics.
 * Does not warm the model — use chat/feedback for that.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getOllamaStatus();
  return NextResponse.json(status, {
    status: status.reachable ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
