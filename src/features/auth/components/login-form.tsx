"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { signInWithPassword, type AuthActionResult } from "../actions";
import { AuthError } from "./auth-error";

/** Email/password login form with inline error + pending states. */
export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<AuthActionResult, FormData>(
    signInWithPassword,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <SubmitButton
        variant="gradient"
        size="lg"
        className="w-full"
        pendingText="Signing in…"
      >
        Sign in
      </SubmitButton>
    </form>
  );
}
