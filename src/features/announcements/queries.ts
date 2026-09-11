import "server-only";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";

/**
 * Announcements + newsletter queries.
 *
 * Global announcements (course_id is null) are publicly readable. Newsletter
 * subscribers are readable only by admins (RLS). Everything returns empty when
 * Supabase isn't configured.
 */

export type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

/** Latest global announcements (course_id null), newest first. */
export async function getAnnouncements(limit = 20): Promise<Announcement[]> {
  if (!integrations.supabase) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("id, title, body, created_at")
      .is("course_id", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as { id: string; title: string; body: string; created_at: string }[]).map(
      (a) => ({ id: a.id, title: a.title, body: a.body, createdAt: a.created_at }),
    );
  } catch {
    return [];
  }
}

export type Subscriber = { id: string; email: string; createdAt: string };

/** Newsletter subscribers (admin only), newest first. */
export async function getSubscribers(): Promise<Subscriber[]> {
  if (!integrations.supabase) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as { id: string; email: string; created_at: string }[]).map((s) => ({
      id: s.id,
      email: s.email,
      createdAt: s.created_at,
    }));
  } catch {
    return [];
  }
}
