"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";

const schema = z.object({ email: z.string().email() });

export type NewsletterResult = { ok: boolean; message: string };

/**
 * Subscribe an email to the newsletter. Anonymous inserts are permitted by the
 * `newsletter_subscribers` RLS policy. Degrades gracefully (still reports
 * success to the visitor) when Supabase isn't configured yet.
 */
export async function subscribeToNewsletter(
  _prev: NewsletterResult | undefined,
  formData: FormData,
): Promise<NewsletterResult> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  if (!integrations.supabase) {
    return {
      ok: true,
      message: "You're on the list! (Connect Supabase to persist subscribers.)",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data.email });

    // Unique-violation means already subscribed — treat as success.
    if (error && error.code !== "23505") {
      return { ok: false, message: "Something went wrong. Please try again." };
    }
    return { ok: true, message: "Thanks for subscribing! Check your inbox." };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
