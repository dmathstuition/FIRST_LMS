"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

/**
 * Browser Supabase client (singleton per tab).
 * Uses the public anon key — all access is governed by Row Level Security.
 *
 * The client is intentionally untyped at this boundary; query results are given
 * explicit types in the feature query modules (src/features/**). Once you
 * regenerate `src/types/database.types.ts` with the Supabase CLI you can add the
 * `<Database>` generic here for end-to-end inference.
 */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
