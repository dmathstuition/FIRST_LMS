"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { clientIdentifier, rateLimit } from "@/lib/rate-limit";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./schemas";

/**
 * Server Actions for authentication.
 *
 * Each returns a discriminated `{ error }` shape on failure so client forms can
 * render inline errors, and redirects on success. All input is re-validated
 * server-side with zod — never trust the client.
 */

export type AuthActionResult = { error: string } | void;

/**
 * Throttle sensitive auth endpoints by client IP. Returns an error result when
 * the caller has exceeded the window, otherwise null to proceed. Centralized so
 * every auth action applies the same brute-force protection consistently.
 */
async function checkRateLimit(
  bucket: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): Promise<{ error: string } | null> {
  const id = await clientIdentifier();
  const result = rateLimit(bucket, id, { limit, windowMs });
  if (!result.success) {
    const mins = Math.ceil(result.retryAfter / 60);
    return {
      error: `Too many attempts. Please try again in ${
        mins <= 1 ? "a minute" : `${mins} minutes`
      }.`,
    };
  }
  return null;
}

async function siteOrigin() {
  // Prefer configured site URL; fall back to the request origin.
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function signInWithPassword(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  // Brute-force protection: 5 sign-in attempts per IP per minute.
  const limited = await checkRateLimit("signin", {
    limit: 5,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const next = (formData.get("next") as string) || "/dashboard";
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  // Limit account creation to 5 per IP per 10 minutes to curb spam signups.
  const limited = await checkRateLimit("signup", {
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;

  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role") ?? "student",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Metadata consumed by the handle_new_user() DB trigger to build the profile.
      data: { full_name: parsed.data.fullName, role: parsed.data.role },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: error.message };

  // With email confirmations enabled, the user must verify before signing in.
  redirect("/verify-email");
}

export async function signInWithOAuth(provider: "google" | "github") {
  const supabase = await createClient();
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${origin}/auth/callback?next=/dashboard` },
  });
  if (error) return { error: error.message };
  if (data.url) redirect(data.url);
}

export async function requestPasswordReset(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  // Limit reset-email requests to 3 per IP per 15 minutes (anti-abuse).
  const limited = await checkRateLimit("password-reset", {
    limit: 3,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/auth/callback?next=/reset-password` },
  );
  // Always report success to avoid leaking which emails exist (enumeration).
  if (error) console.error("resetPasswordForEmail:", error.message);
  redirect("/forgot-password?sent=1");
}

export async function updatePassword(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
