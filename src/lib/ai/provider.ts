/**
 * AI features abstraction (Course Assistant, Tutor, Quiz Generator, etc.).
 *
 * The real adapter targets the Anthropic Claude API. Until `ANTHROPIC_API_KEY`
 * is set, a deterministic mock returns helpful placeholder responses so the AI
 * UI can be built and demoed without a key or network. Server-only — never
 * import this into a client component (the SDK + key must stay server-side).
 */
import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { integrations } from "@/lib/env";

/** Default model. Overridable via ANTHROPIC_MODEL (e.g. a cheaper tier). */
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorRequest {
  courseTitle: string;
  lessonTitle?: string;
  question: string;
  history?: ChatMessage[];
}

export interface GeneratedQuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AIProvider {
  readonly name: "claude" | "mock";
  /** Answer a learner question grounded in course/lesson context. */
  askTutor(req: TutorRequest): Promise<string>;
  /** Generate quiz questions from lesson content. */
  generateQuiz(content: string, count: number): Promise<GeneratedQuizQuestion[]>;
  /** Summarize lesson content into concise notes. */
  summarize(content: string): Promise<string>;
}

/** Deterministic offline mock — safe for local dev and CI. */
class MockAIProvider implements AIProvider {
  readonly name = "mock" as const;

  async askTutor(req: TutorRequest): Promise<string> {
    return (
      `Here's a hint for "${req.question}" in the context of ` +
      `${req.lessonTitle ?? req.courseTitle}: break the problem into smaller ` +
      `steps and identify what you already know before solving. ` +
      `(AI Tutor is running in mock mode — set ANTHROPIC_API_KEY to enable live answers.)`
    );
  }

  async generateQuiz(
    _content: string,
    count: number,
  ): Promise<GeneratedQuizQuestion[]> {
    return Array.from({ length: count }, (_, i) => ({
      prompt: `Sample question ${i + 1} generated from the lesson content.`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: "Option A is correct in this mock example.",
    }));
  }

  async summarize(content: string): Promise<string> {
    const preview = content.slice(0, 140).trim();
    return `Summary (mock): ${preview}${content.length > 140 ? "…" : ""}`;
  }
}

/**
 * Live adapter backed by the Anthropic Claude API. Instantiated only when
 * `ANTHROPIC_API_KEY` is present. Effort is kept low for the tutor so answers
 * are fast and inexpensive; quiz generation uses a bit more headroom.
 */
class ClaudeProvider implements AIProvider {
  readonly name = "claude" as const;
  private client = new Anthropic(); // reads ANTHROPIC_API_KEY from the env

  private textOf(message: Anthropic.Message): string {
    return message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
  }

  async askTutor(req: TutorRequest): Promise<string> {
    const context = req.lessonTitle
      ? `the lesson "${req.lessonTitle}" in the course "${req.courseTitle}"`
      : `the course "${req.courseTitle}"`;

    const system =
      `You are the D-MATHS Study Assistant, a warm, patient tutor helping a ` +
      `learner with ${context}. Explain clearly with short worked steps and ` +
      `plain language. Prefer to build intuition and nudge the learner to ` +
      `think, rather than only giving the final answer. Keep replies concise ` +
      `(a few short paragraphs at most). If a question is unrelated to ` +
      `learning, gently steer back to the course.`;

    const history = (req.history ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const message = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "low" },
      system,
      messages: [...history, { role: "user", content: req.question }],
    });

    return this.textOf(message);
  }

  async generateQuiz(
    content: string,
    count: number,
  ): Promise<GeneratedQuizQuestion[]> {
    const system =
      `You write high-quality multiple-choice quiz questions from lesson ` +
      `content. Each question has exactly 4 options, one correct. Return ONLY ` +
      `a JSON array (no prose, no code fences) of objects with keys: ` +
      `"prompt" (string), "options" (array of 4 strings), "correctIndex" ` +
      `(0-3), "explanation" (string).`;

    const message = await this.client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      output_config: { effort: "medium" },
      system,
      messages: [
        {
          role: "user",
          content: `Write ${count} questions from this lesson content:\n\n${content.slice(0, 8000)}`,
        },
      ],
    });

    const raw = this.textOf(message);
    try {
      const json = raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1);
      const parsed = JSON.parse(json) as GeneratedQuizQuestion[];
      return parsed
        .filter(
          (q) =>
            q?.prompt &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            typeof q.correctIndex === "number",
        )
        .slice(0, count);
    } catch {
      return [];
    }
  }

  async summarize(content: string): Promise<string> {
    const message = await this.client.messages.create({
      model: MODEL,
      max_tokens: 512,
      output_config: { effort: "low" },
      system:
        "Summarize the following lesson into 3-5 concise bullet points a " +
        "learner can revise from. Return plain text bullets only.",
      messages: [{ role: "user", content: content.slice(0, 8000) }],
    });
    return this.textOf(message);
  }
}

/**
 * Resolve the active AI provider. Returns the live Claude adapter when
 * `ANTHROPIC_API_KEY` is configured, otherwise the offline mock.
 */
export function getAIProvider(): AIProvider {
  if (integrations.ai) return new ClaudeProvider();
  return new MockAIProvider();
}
