"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { createCategory, type ActionState } from "../actions";

/** Inline "add category" form. Resets on success. */
export function CategoryForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createCategory,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div>
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Input name="name" placeholder="Category name" required className="flex-1" aria-label="Category name" />
        <Input
          name="description"
          placeholder="Short description (optional)"
          className="flex-1"
          aria-label="Category description"
        />
        <SubmitButton variant="gradient" pendingText="Adding…">
          <Plus className="size-4" /> Add
        </SubmitButton>
      </form>
      {state && (
        <p
          role="status"
          className={`mt-2 flex items-center gap-1.5 text-sm ${
            state.ok
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {state.message}
        </p>
      )}
    </div>
  );
}
