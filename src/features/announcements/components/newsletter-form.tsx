"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { subscribeNewsletter, type AnnouncementActionState } from "../actions";

/** Compact newsletter signup. Used in the footer. Resets on success. */
export function NewsletterForm() {
  const [state, formAction] = useActionState<AnnouncementActionState, FormData>(
    subscribeNewsletter,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div>
      <form ref={formRef} action={formAction} className="flex gap-2">
        <Input
          name="email"
          type="email"
          required
          placeholder="Your email"
          aria-label="Email address"
          className="h-10 flex-1"
        />
        <SubmitButton variant="gradient" pendingText="…" className="shrink-0">
          <Send className="size-4" /> Subscribe
        </SubmitButton>
      </form>
      {state && (
        <p
          role="status"
          className={`mt-2 flex items-center gap-1.5 text-xs ${
            state.ok
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="size-3.5" />
          ) : (
            <AlertCircle className="size-3.5" />
          )}
          {state.message}
        </p>
      )}
    </div>
  );
}
