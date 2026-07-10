"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";

const profileSchema = z.object({
  fullName: z.string().min(2, "Please enter your name").max(80),
  headline: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(600).optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
  website: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

/**
 * Update the signed-in user's profile row. RLS restricts writes to `auth.uid()`,
 * so no ownership check is needed here. Falls back to a friendly no-op message
 * when Supabase isn't connected yet.
 */
export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    country: formData.get("country"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!integrations.supabase) {
    return {
      ok: true,
      message: "Profile saved. (Connect Supabase to persist changes.)",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "You must be signed in." };

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        headline: parsed.data.headline || null,
        bio: parsed.data.bio || null,
        country: parsed.data.country || null,
        website: parsed.data.website || null,
      })
      .eq("id", user.id);

    if (error) return { ok: false, message: error.message };

    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Your profile has been updated." };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
