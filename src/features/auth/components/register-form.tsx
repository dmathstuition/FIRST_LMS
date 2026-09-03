"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { signUp, type AuthActionResult } from "../actions";
import { AuthError } from "./auth-error";

/** Learner registration form (D-MATHS is the only tutor; all signups are students). */
export function RegisterForm() {
  const [state, formAction] = useActionState<AuthActionResult, FormData>(
    signUp,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <AuthError error={state?.error} />

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          placeholder="Ada Lovelace"
          required
        />
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
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
        <Label htmlFor="confirmPassword">Confirm password</Label>
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
        pendingText="Creating account…"
      >
        Create account
      </SubmitButton>
    </form>
  );
}
