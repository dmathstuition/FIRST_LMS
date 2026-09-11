"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { integrations } from "@/lib/env";
import { clientIdentifier, rateLimit } from "@/lib/rate-limit";

export type AnnouncementActionState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

/* ------------------------------ newsletter -------------------------------- */

const emailSchema = z.string().email("Enter a valid email address").max(200);

/** Public newsletter signup. Rate-limited and idempotent on the email. */
export async function subscribeNewsletter(
  _prev: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  const id = await clientIdentifier();
  const limited = rateLimit("newsletter", id, { limit: 5, windowMs: 60_000 });
  if (!limited.success) {
    return { ok: false, message: "Too many attempts. Please try again shortly." };
  }

  if (!integrations.supabase) {
    return { ok: true, message: "You're subscribed! (Connect Supabase to persist.)" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data });
    // Unique-violation → already subscribed; treat as success (no enumeration).
    if (error && error.code !== "23505") {
      return { ok: false, message: "Could not subscribe right now. Try again later." };
    }
  } catch {
    return { ok: false, message: "Could not subscribe right now. Try again later." };
  }

  return { ok: true, message: "You're on the list — thanks for subscribing!" };
}

/* ----------------------------- announcements ------------------------------ */

const announcementSchema = z.object({
  title: z.string().min(3, "Give the announcement a title").max(160),
  body: z.string().min(3, "Write the announcement").max(5000),
});

/** Create a global announcement (admin only). */
export async function createAnnouncement(
  _prev: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!integrations.supabase) {
    return { ok: true, message: "Announcement posted. (Connect Supabase to persist.)" };
  }

  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return { ok: false, message: "Not authorized." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("announcements").insert({
      title: parsed.data.title,
      body: parsed.data.body,
      author_id: user.id,
      course_id: null,
    });
    if (error) return { ok: false, message: error.message };
  } catch {
    return { ok: false, message: "Could not post the announcement." };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
  return { ok: true, message: "Announcement posted." };
}

/** Delete an announcement (admin only via RLS). */
export async function deleteAnnouncement(id: string) {
  if (!integrations.supabase) return;
  const supabase = await createClient();
  await supabase.from("announcements").delete().eq("id", id);
  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}
