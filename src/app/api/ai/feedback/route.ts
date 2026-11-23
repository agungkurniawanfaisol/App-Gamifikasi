import { NextResponse } from "next/server";
import { ContentItemType } from "@prisma/client";
import { auth } from "@/auth";
import { getUserId } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { buildFeedbackPrompt, generateFeedback } from "@/lib/ollama";
import { updateAnswerFeedback } from "@/actions/student/quiz";
import { getSubQuestionsFromItem } from "@/lib/content-item";
import { labels } from "@/lib/labels";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const FEEDBACK_RATE_LIMIT = 30;
const FEEDBACK_RATE_WINDOW_MS = 60 * 1000;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: number;
  try {
    userId = getUserId(session);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = checkRateLimit(
    `ai-feedback:user:${userId}`,
    FEEDBACK_RATE_LIMIT,
    FEEDBACK_RATE_WINDOW_MS
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: labels.errors.tooManyRequests },
      { status: 429, headers: rateLimitHeaders(rate) }
    );
  }

  const body = (await request.json()) as {
    contentItemId?: number;
    questionId?: number;
    subQuestionIndex?: number;
    userAnswer?: string;
  };

  const contentItemId = body.contentItemId ?? body.questionId;
  if (!contentItemId || !body.userAnswer) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const subQuestionIndex = body.subQuestionIndex ?? 0;

  const item = await prisma.groupContentItem.findUnique({
    where: { id: contentItemId },
  });
  if (!item || item.type !== ContentItemType.QUESTION) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const subs = getSubQuestionsFromItem(item);
  const sub = subs[subQuestionIndex];
  if (!sub) {
    return NextResponse.json({ error: "Sub-question not found" }, { status: 404 });
  }

  const isCorrect =
    sub.correctAnswer != null && body.userAnswer === sub.correctAnswer;

  const prompt = buildFeedbackPrompt(
    sub.questionText,
    body.userAnswer,
    sub.correctAnswer ?? sub.expectedSpeech ?? "",
    sub.explanation
  );

  try {
    const feedback = await generateFeedback(prompt);
    await updateAnswerFeedback(
      contentItemId,
      userId,
      feedback,
      subQuestionIndex
    );
    return NextResponse.json({ feedback, isCorrect });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI feedback failed";
    if (
      message.includes("ECONNREFUSED") ||
      message.includes("fetch failed") ||
      message.includes("TimeoutError") ||
      message.includes("aborted") ||
      message.includes("timed out")
    ) {
      return NextResponse.json(
        { feedback: labels.api.feedbackUnavailable, isCorrect },
        { status: 200 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
