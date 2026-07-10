"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  Check,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GripVertical,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { saveQuiz, type QuizPayload, type FormState } from "../actions";

type QType = "multiple_choice" | "true_false";

interface EditorOption {
  content: string;
  isCorrect: boolean;
}
interface EditorQuestion {
  id: string;
  type: QType;
  prompt: string;
  points: number;
  options: EditorOption[];
}

let seq = 0;
const newId = () => `q${++seq}`;

function blankQuestion(type: QType): EditorQuestion {
  return {
    id: newId(),
    type,
    prompt: "",
    points: 1,
    options:
      type === "true_false"
        ? [
            { content: "True", isCorrect: true },
            { content: "False", isCorrect: false },
          ]
        : [
            { content: "", isCorrect: true },
            { content: "", isCorrect: false },
          ],
  };
}

/**
 * Interactive quiz builder. Manages questions + options in local state and
 * persists via the saveQuiz Server Action. Supports multiple-choice (single
 * correct answer) and true/false questions.
 */
export function QuizBuilder({ courseId }: { courseId: string }) {
  const [title, setTitle] = React.useState("");
  const [passPct, setPassPct] = React.useState(70);
  const [questions, setQuestions] = React.useState<EditorQuestion[]>([
    blankQuestion("multiple_choice"),
  ]);
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<FormState>(undefined);

  function addQuestion(type: QType) {
    setQuestions((qs) => [...qs, blankQuestion(type)]);
  }
  function removeQuestion(id: string) {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  }
  function updateQuestion(id: string, patch: Partial<EditorQuestion>) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }
  function updateOption(
    qId: string,
    idx: number,
    patch: Partial<EditorOption>,
  ) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((o, i) =>
                i === idx ? { ...o, ...patch } : o,
              ),
            }
          : q,
      ),
    );
  }
  function setCorrect(qId: string, idx: number) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o, i) => ({ ...o, isCorrect: i === idx })) }
          : q,
      ),
    );
  }
  function addOption(qId: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? { ...q, options: [...q.options, { content: "", isCorrect: false }] }
          : q,
      ),
    );
  }
  function removeOption(qId: string, idx: number) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId && q.options.length > 2
          ? { ...q, options: q.options.filter((_, i) => i !== idx) }
          : q,
      ),
    );
  }

  async function handleSave() {
    setResult(undefined);
    setPending(true);
    const payload: QuizPayload = {
      title,
      passPct,
      questions: questions.map((q) => ({
        type: q.type,
        prompt: q.prompt,
        points: q.points,
        options: q.options,
      })),
    };
    const res = await saveQuiz(courseId, payload);
    setResult(res);
    setPending(false);
  }

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  return (
    <div className="space-y-6">
      {/* Quiz meta */}
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Quiz title</Label>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 1 Knowledge Check"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass-pct">Pass mark (%)</Label>
            <Input
              id="pass-pct"
              type="number"
              min={0}
              max={100}
              value={passPct}
              onChange={(e) => setPassPct(Number(e.target.value))}
              className="w-28"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {questions.length} question{questions.length === 1 ? "" : "s"} ·{" "}
          {totalPoints} point{totalPoints === 1 ? "" : "s"} total
        </p>
      </Card>

      {/* Questions */}
      {questions.map((q, qi) => (
        <Card key={q.id} className="p-5">
          <div className="flex items-start gap-3">
            <GripVertical className="mt-2 size-4 shrink-0 text-muted-foreground" />
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  Q{qi + 1}
                </span>
                <select
                  value={q.type}
                  onChange={(e) => {
                    const type = e.target.value as QType;
                    updateQuestion(q.id, {
                      type,
                      options: blankQuestion(type).options,
                    });
                  }}
                  className="h-9 rounded-lg border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Question type"
                >
                  <option value="multiple_choice">Multiple choice</option>
                  <option value="true_false">True / False</option>
                </select>
                <div className="ml-auto flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={q.points}
                    onChange={(e) =>
                      updateQuestion(q.id, { points: Number(e.target.value) })
                    }
                    className="w-16"
                    aria-label="Points"
                  />
                  <span className="text-xs text-muted-foreground">pts</span>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(q.id)}
                      aria-label="Remove question"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>

              <Input
                value={q.prompt}
                onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                placeholder="Enter your question…"
              />

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrect(q.id, oi)}
                      aria-label={
                        opt.isCorrect ? "Correct answer" : "Mark as correct"
                      }
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                        opt.isCorrect
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "hover:border-emerald-500",
                      )}
                    >
                      {opt.isCorrect && <Check className="size-3.5" />}
                    </button>
                    <Input
                      value={opt.content}
                      onChange={(e) =>
                        updateOption(q.id, oi, { content: e.target.value })
                      }
                      placeholder={`Option ${oi + 1}`}
                      disabled={q.type === "true_false"}
                    />
                    {q.type === "multiple_choice" && q.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(q.id, oi)}
                        aria-label="Remove option"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {q.type === "multiple_choice" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addOption(q.id)}
                  >
                    <Plus className="size-4" /> Add option
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Add question + save */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => addQuestion("multiple_choice")}
        >
          <Plus className="size-4" /> Add question
        </Button>
        <Button
          type="button"
          variant="gradient"
          onClick={handleSave}
          disabled={pending || !title || questions.some((q) => !q.prompt)}
          className="ml-auto"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {pending ? "Saving…" : "Save quiz"}
        </Button>
      </div>

      {result && (
        <div
          role="status"
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
            result.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {result.ok ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {result.message}
        </div>
      )}
    </div>
  );
}
