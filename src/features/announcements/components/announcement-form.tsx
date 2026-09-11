"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, Megaphone } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { createAnnouncement, type AnnouncementActionState } from "../actions";

/** Admin form to post a global announcement. Resets on success. */
export function AnnouncementForm() {
  const [state, formAction] = useActionState<AnnouncementActionState, FormData>(
    createAnnouncement,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={160}
          placeholder="e.g. New cohort opens in October"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Message</Label>
        <Textarea
          id="body"
          name="body"
          required
          rows={4}
          maxLength={5000}
          placeholder="Share the news with your learners…"
        />
      </div>

      <SubmitButton variant="gradient" pendingText="Posting…">
        <Megaphone className="size-4" /> Post announcement
      </SubmitButton>
    </form>
  );
}
