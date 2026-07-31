import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export interface SessionUser {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

/**
 * Fetch the current authenticated user joined with their profile row.
 * Returns null when unauthenticated. Safe to call from Server Components.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  // Defensive: a misconfigured or unreachable Supabase project makes the auth
  // call throw. Treat any failure as "not signed in" so protected pages redirect
  // to /login instead of surfacing a 500 to the visitor.
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .single();

    const profile = data as {
      full_name: string | null;
      avatar_url: string | null;
      role: UserRole;
    } | null;

    return {
      id: user.id,
      email: user.email ?? null,
      fullName: profile?.full_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      role: profile?.role ?? "student",
    };
  } catch {
    return null;
  }
}

/** Require an authenticated user; redirect to /login otherwise. */
export async function requireUser(next = "/dashboard"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/**
 * Require a user with one of the allowed roles. Redirects unauthenticated users
 * to /login and unauthorized users to their dashboard.
 */
export async function requireRole(
  allowed: UserRole[],
  next = "/dashboard",
): Promise<SessionUser> {
  const user = await requireUser(next);
  if (!allowed.includes(user.role)) redirect("/dashboard");
  return user;
}
