"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { updatePassword, type AuthActionResult } from "../actions";
import { AuthError } from "./auth-error";

/** Sets a new password after following the reset link (session established). */
export function ResetPasswordForm() {
  const [state, formAction] = useActionState<AuthActionResult, FormData>(
    updatePassword,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <AuthError error={state?.error} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          required
        />
      </div>
      <SubmitButton
        variant="gradient"
        size="lg"
        className="w-full"
        pendingText="Updating…"
      >
        Update password
      </SubmitButton>
    </form>
  );
}
