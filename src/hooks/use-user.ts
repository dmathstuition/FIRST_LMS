"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

/**
 * Client-side hook exposing the current Supabase auth user and loading state.
 * Subscribes to auth changes so UI (navbar, menus) reacts to sign in/out.
 */
export function useUser() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
