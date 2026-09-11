"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle, Ticket } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import {
  registerForProgram,
  type ProgramActionState,
} from "../actions";

/** Public "reserve a spot" form on a program detail page. */
export function ProgramRegisterForm({
  programId,
  programSlug,
  defaultName,
  defaultEmail,
}: {
  programId: string;
  programSlug: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const action = registerForProgram.bind(null, programId, programSlug);
  const [state, formAction] = useActionState<ProgramActionState, FormData>(
    action,
    undefined,
  );

  if (state?.ok) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-5 shrink-0" />
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.ok && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reg-name">Full name</Label>
        <Input
          id="reg-name"
          name="name"
          required
          defaultValue={defaultName}
          placeholder="Your name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-note">Anything we should know? (optional)</Label>
        <Textarea
          id="reg-note"
          name="note"
          rows={3}
          placeholder="Your goals, questions, or experience level…"
        />
      </div>

      <SubmitButton variant="gradient" pendingText="Reserving…" className="w-full">
        <Ticket className="size-4" /> Reserve my spot
      </SubmitButton>
      <p className="text-center text-xs text-muted-foreground">
        No payment now — we&apos;ll email you the enrolment details.
      </p>
    </form>
  );
}
