import { NextResponse, type NextRequest } from "next/server";

import { getAIProvider } from "@/lib/ai/provider";
import { getSessionUser } from "@/lib/auth";
import { integrations } from "@/lib/env";
import { clientIdentifier, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * AI quiz generation for the course builder. Instructor/admin-only when
 * Supabase auth is configured; open in demo mode (mock provider, no key cost).
 * Returns multiple-choice questions from a topic or pasted lesson content.
 */
export async function POST(req: NextRequest) {
  // Restrict to instructors/admins when a real auth backend is present.
  if (integrations.supabase) {
    const user = await getSessionUser();
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
  }

  const id = await clientIdentifier();
  const limited = rateLimit("ai-quiz", id, { limit: 10, windowMs: 60_000 });
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  let body: { content?: string; count?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const content = (body.content ?? "").trim();
  if (content.length < 8) {
    return NextResponse.json(
      { error: "Describe a topic or paste some lesson content first." },
      { status: 400 },
    );
  }
  const count = Math.min(Math.max(Number(body.count) || 5, 1), 10);

  try {
    const questions = await getAIProvider().generateQuiz(content, count);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("ai/quiz error:", error);
    return NextResponse.json(
      { error: "Couldn't generate questions right now. Please try again." },
      { status: 502 },
    );
  }
}
