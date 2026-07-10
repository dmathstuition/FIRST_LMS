"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { setUserRole } from "../actions";
import type { UserRole } from "@/types";

/** Inline role editor for the admin users table. Persists on change. */
export function UserRoleSelect({
  userId,
  role,
}: {
  userId: string;
  role: UserRole;
}) {
  const [value, setValue] = React.useState<UserRole>(role);
  const [pending, startTransition] = React.useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as UserRole;
    setValue(next);
    startTransition(async () => {
      await setUserRole(userId, next);
    });
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <select
        value={value}
        onChange={onChange}
        disabled={pending}
        aria-label="Change role"
        className={cn(
          "h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          pending && "opacity-60",
        )}
      >
        <option value="student">Student</option>
        <option value="instructor">Instructor</option>
        <option value="admin">Admin</option>
      </select>
      {pending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
    </span>
  );
}
