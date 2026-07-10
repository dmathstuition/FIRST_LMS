/**
 * AI features abstraction (Course Assistant, Tutor, Quiz Generator, etc.).
 *
 * The real adapter targets the Anthropic Claude API (recommended). Until
 * `ANTHROPIC_API_KEY` is set, a deterministic mock returns helpful placeholder
 * responses so the AI UI can be built and demoed without a key or network.
 */

import { integrations } from "@/lib/env";

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
 * Resolve the active AI provider. Returns the Claude adapter once configured
 * (added in the AI features phase), otherwise the mock.
 */
export function getAIProvider(): AIProvider {
  if (integrations.ai) {
    // return new ClaudeProvider();  // wired when ANTHROPIC_API_KEY is set
  }
  return new MockAIProvider();
}
