import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / email-link callback handler.
 *
 * Supabase redirects here with a `code` after Google/GitHub sign-in, email
 * confirmation, or a password-reset link. We exchange the code for a session
 * (stored in secure cookies) and forward the user to `next` (default /dashboard).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Respect proxy headers when deployed behind a load balancer (Vercel).
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";
      if (isLocal) return NextResponse.redirect(`${origin}${next}`);
      if (forwardedHost)
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // On error, send the user to login with a friendly message.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
