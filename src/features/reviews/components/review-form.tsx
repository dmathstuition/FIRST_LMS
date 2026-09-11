"use client";

import * as React from "react";
import { useActionState } from "react";
import { Star, CheckCircle2, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";
import { submitReview, deleteReview, type ReviewActionState } from "../actions";

/** Interactive "write a review" form with a star picker. Pre-fills for edits. */
export function ReviewForm({
  courseId,
  courseSlug,
  existing,
}: {
  courseId: string;
  courseSlug: string;
  existing: { rating: number; title: string | null; content: string | null } | null;
}) {
  const action = submitReview.bind(null, courseId, courseSlug);
  const [state, formAction] = useActionState<ReviewActionState, FormData>(
    action,
    undefined,
  );

  const [rating, setRating] = React.useState(existing?.rating ?? 0);
  const [hover, setHover] = React.useState(0);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border bg-card p-5">
      <div>
        <p className="font-semibold">
          {existing ? "Update your review" : "Write a review"}
        </p>
        <p className="text-sm text-muted-foreground">
          Share how this course helped you.
        </p>
      </div>

      {state && (
        <div
          role="status"
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {state.ok ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {state.message}
        </div>
      )}

      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            aria-pressed={rating === n}
            className="p-0.5"
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                (hover || rating) >= n
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>

      <Input
        name="title"
        defaultValue={existing?.title ?? ""}
        placeholder="Title (optional) — e.g. Finally understood calculus!"
        maxLength={120}
        aria-label="Review title"
      />
      <Textarea
        name="content"
        defaultValue={existing?.content ?? ""}
        rows={4}
        placeholder="What did you like? What could be better?"
        maxLength={2000}
        aria-label="Review details"
      />

      <div className="flex items-center gap-2">
        <SubmitButton variant="gradient" pendingText="Posting…">
          {existing ? "Update review" : "Post review"}
        </SubmitButton>
        {existing && (
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            formAction={deleteReview.bind(null, courseId, courseSlug)}
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
