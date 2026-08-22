import { NextResponse, type NextRequest } from "next/server";

import { getAIProvider } from "@/lib/ai/provider";
import { clientIdentifier, rateLimit } from "@/lib/rate-limit";
import type { ChatMessage } from "@/lib/ai/provider";

export const runtime = "nodejs";

/**
 * AI Study Assistant endpoint. Answers a learner's question grounded in the
 * course/lesson context. Uses the live Claude adapter when ANTHROPIC_API_KEY is
 * set, otherwise a safe offline mock. Rate-limited by IP to protect the API key.
 */
export async function POST(req: NextRequest) {
  const id = await clientIdentifier();
  const limited = rateLimit("ai-tutor", id, { limit: 15, windowMs: 60_000 });
  if (!limited.success) {
    return NextResponse.json(
      { error: "You're sending messages too quickly. Please wait a moment." },
      { status: 429 },
    );
  }

  let body: {
    courseTitle?: string;
    lessonTitle?: string;
    question?: string;
    history?: ChatMessage[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
  }
  if (question.length > 2000) {
    return NextResponse.json(
      { error: "That message is too long — please shorten it." },
      { status: 400 },
    );
  }

  // Keep only the last few turns to bound cost/latency.
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

  try {
    const answer = await getAIProvider().askTutor({
      courseTitle: body.courseTitle || "your course",
      lessonTitle: body.lessonTitle,
      question,
      history,
    });
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("ai/tutor error:", error);
    return NextResponse.json(
      { error: "The assistant is unavailable right now. Please try again." },
      { status: 502 },
    );
  }
}
