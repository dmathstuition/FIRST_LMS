import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env, integrations } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on every request and enforces
 * role-based route protection. Called from the root `middleware.ts`.
 *
 * Protected areas:
 *   /dashboard/**   → any authenticated user
 *   /instructor/**  → instructor or admin
 *   /admin/**       → admin only
 *
 * Unauthenticated users hitting a protected route are redirected to /login
 * with a `next` param so they return to their destination after signing in.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/learn");

  // Fast path: when Supabase isn't configured (demo mode), there is no auth
  // server to talk to. Skip the network round-trip entirely — otherwise every
  // request would block on a doomed call to the placeholder host, which is what
  // makes the site feel like it's "hanging". Public pages pass straight through;
  // protected pages redirect to /login (nothing to authenticate against).
  if (!integrations.supabase) {
    if (isProtected) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the token with the Auth server.
  // Wrapped defensively: if Supabase is unreachable or misconfigured, the auth
  // call can throw — and because this middleware runs on EVERY request, an
  // unhandled throw would turn every page (including the public landing page)
  // into a 500. Instead we degrade gracefully: public pages render normally,
  // and protected pages fall through to the unauthenticated redirect below.
  let user: { id: string } | null = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    user = null;
  }

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Role gating for elevated areas (defense-in-depth; RLS is the real guard).
  if (
    user &&
    (pathname.startsWith("/admin") || pathname.startsWith("/instructor"))
  ) {
    let role = "student";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = (profile as { role?: string } | null)?.role ?? "student";
    } catch {
      role = "student";
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    if (
      pathname.startsWith("/instructor") &&
      role !== "instructor" &&
      role !== "admin"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
