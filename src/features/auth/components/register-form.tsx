"use client";

import { useActionState, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";
import { signUp, type AuthActionResult } from "../actions";
import { AuthError } from "./auth-error";

/** Registration form with role selection (student / instructor). */
export function RegisterForm({
  defaultRole = "student",
}: {
  defaultRole?: "student" | "instructor";
}) {
  const [state, formAction] = useActionState<AuthActionResult, FormData>(
    signUp,
    undefined,
  );
  const [role, setRole] = useState<"student" | "instructor">(defaultRole);

  return (
    <form action={formAction} className="space-y-4">
      <AuthError error={state?.error} />

      {/* Role selector */}
      <input type="hidden" name="role" value={role} />
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
        {(["student", "instructor"] as const).map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={role === r}
            onClick={() => setRole(r)}
            className={cn(
              "rounded-xl border p-3 text-left text-sm capitalize transition-all",
              role === r
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:border-primary/40",
            )}
          >
            <span className="font-medium">{r}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {r === "student" ? "Learn new skills" : "Teach & earn"}
            </span>
          </button>
        ))}
      </div>

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
