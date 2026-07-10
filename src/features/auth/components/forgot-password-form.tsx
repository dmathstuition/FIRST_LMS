"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { requestPasswordReset, type AuthActionResult } from "../actions";
import { AuthError } from "./auth-error";

/** Requests a password-reset email. */
export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<AuthActionResult, FormData>(
    requestPasswordReset,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <AuthError error={state?.error} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <SubmitButton
        variant="gradient"
        size="lg"
        className="w-full"
        pendingText="Sending link…"
      >
        Send reset link
      </SubmitButton>
    </form>
  );
}
