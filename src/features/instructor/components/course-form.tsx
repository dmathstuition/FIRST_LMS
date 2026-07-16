"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { createCourse, updateCourse, type FormState } from "../actions";
import type { Category } from "@/types";

export interface CourseFormDefaults {
  title?: string;
  subtitle?: string;
  description?: string;
  categoryId?: string;
  level?: "beginner" | "intermediate" | "advanced" | "all";
  price?: number;
}

/**
 * Create/edit course form. When `courseId` is provided it edits (bound
 * updateCourse); otherwise it creates (createCourse, which redirects to the
 * new course's builder on success).
 */
export function CourseForm({
  categories,
  defaults,
  courseId,
  basePath = "/instructor",
}: {
  categories: Category[];
  defaults?: CourseFormDefaults;
  courseId?: string;
  /** "/instructor" or "/admin" — where create redirects and edits revalidate. */
  basePath?: string;
}) {
  const action = courseId
    ? updateCourse.bind(null, basePath, courseId)
    : createCourse.bind(null, basePath);
  const [state, formAction] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Course title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaults?.title}
          placeholder="e.g. Mastering Calculus from Scratch"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          name="subtitle"
          defaultValue={defaults?.subtitle}
          placeholder="A short, compelling one-liner"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={defaults?.categoryId ?? ""}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="level">Level</Label>
          <select
            id="level"
            name="level"
            defaultValue={defaults?.level ?? "all"}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={defaults?.price ?? 0}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaults?.description}
          rows={6}
          placeholder="Describe what students will learn and why it matters…"
        />
      </div>

      <SubmitButton variant="gradient" pendingText="Saving…">
        {courseId ? "Save changes" : "Create course"}
      </SubmitButton>
    </form>
  );
}
