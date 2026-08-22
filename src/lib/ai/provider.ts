/**
 * AI features abstraction (Course Assistant, Tutor, Quiz Generator, etc.).
 *
 * The real adapter targets the DeepSeek API (OpenAI-compatible chat
 * completions). Until `DEEPSEEK_API_KEY` is set, a deterministic mock returns
 * helpful placeholder responses so the AI UI can be built and demoed without a
 * key or network. Server-only — never import this into a client component (the
 * API key must stay server-side).
 */
import "server-only";

import { integrations } from "@/lib/env";

const DEEPSEEK_API = "https://api.deepseek.com/chat/completions";
/** Default model. Overridable via DEEPSEEK_MODEL (e.g. "deepseek-reasoner"). */
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

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
  readonly name: "deepseek" | "mock";
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
      `(AI Tutor is running in mock mode — set DEEPSEEK_API_KEY to enable live answers.)`
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

interface OpenAIStyleMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Live adapter backed by the DeepSeek API (OpenAI-compatible chat completions).
 * Instantiated only when `DEEPSEEK_API_KEY` is present.
 */
class DeepSeekProvider implements AIProvider {
  readonly name = "deepseek" as const;
  private apiKey = process.env.DEEPSEEK_API_KEY as string;

  /** One chat completion call. `jsonMode` asks DeepSeek for strict JSON. */
  private async chat(
    messages: OpenAIStyleMessage[],
    opts: { maxTokens: number; temperature?: number; jsonMode?: boolean },
  ): Promise<string> {
    const res = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature ?? 0.7,
        ...(opts.jsonMode
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
    });

    if (!res.ok) {
      throw new Error(`DeepSeek API error ${res.status}`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return (json.choices?.[0]?.message?.content ?? "").trim();
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

    const history: OpenAIStyleMessage[] = (req.history ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    return this.chat(
      [
        { role: "system", content: system },
        ...history,
        { role: "user", content: req.question },
      ],
      { maxTokens: 1024 },
    );
  }

  async generateQuiz(
    content: string,
    count: number,
  ): Promise<GeneratedQuizQuestion[]> {
    const system =
      `You write high-quality multiple-choice quiz questions from lesson ` +
      `content. Each question has exactly 4 options, one correct. Return a JSON ` +
      `object of the form {"questions": [{"prompt": string, "options": ` +
      `[4 strings], "correctIndex": 0-3, "explanation": string}]}.`;

    const raw = await this.chat(
      [
        { role: "system", content: system },
        {
          role: "user",
          content: `Write ${count} questions from this lesson content:\n\n${content.slice(0, 8000)}`,
        },
      ],
      { maxTokens: 2048, temperature: 0.4, jsonMode: true },
    );

    try {
      const parsed = JSON.parse(raw) as {
        questions?: GeneratedQuizQuestion[];
      };
      return (parsed.questions ?? [])
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
    return this.chat(
      [
        {
          role: "system",
          content:
            "Summarize the following lesson into 3-5 concise bullet points a " +
            "learner can revise from. Return plain text bullets only.",
        },
        { role: "user", content: content.slice(0, 8000) },
      ],
      { maxTokens: 512, temperature: 0.3 },
    );
  }
}

/**
 * Resolve the active AI provider. Returns the live DeepSeek adapter when
 * `DEEPSEEK_API_KEY` is configured, otherwise the offline mock.
 */
export function getAIProvider(): AIProvider {
  if (integrations.ai) return new DeepSeekProvider();
  return new MockAIProvider();
}
