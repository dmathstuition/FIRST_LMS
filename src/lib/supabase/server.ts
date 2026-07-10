import { cookies } from "next/headers";
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";

import { env } from "@/lib/env";

/**
 * Server Supabase client for Server Components, Route Handlers, and Server Actions.
 * Reads/writes the session from secure, httpOnly cookies (SSR auth).
 *
 * NOTE: In pure Server Components cookie writes are no-ops (handled by
 * middleware) — the try/catch guards that expected case.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore; the session is
            // refreshed in middleware instead.
          }
        },
      },
    },
  );
}
