import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { isAppUserId, parseAppUserId } from "@/lib/auth-identity";
import {
  executeSubmitContentAnswer,
  SubmitContentAnswerError,
} from "@/lib/submit-content-answer";
import { labels } from "@/lib/labels";

export async function POST(request: Request) {
  const session = await auth();
  if (
    !session?.user?.id ||
    !isAppUserId(session.user.id) ||
    session.user.role !== Role.STUDENT
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseAppUserId(session.user.id);
  if (userId == null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    contentItemId?: number;
    answer?: string;
    scorePercent?: number;
    subQuestionIndex?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const contentItemId = body.contentItemId;
  const answer = typeof body.answer === "string" ? body.answer : "";
  if (!contentItemId || !Number.isFinite(contentItemId) || !answer.trim()) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const subQuestionIndex = body.subQuestionIndex ?? 0;

  try {
    const result = await executeSubmitContentAnswer(
      userId,
      contentItemId,
      answer,
      body.scorePercent,
      subQuestionIndex
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SubmitContentAnswerError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("[api/student/submit-answer]", error);
    return NextResponse.json(
      { error: labels.student.answerSaveFailed },
      { status: 500 }
    );
  }
}
