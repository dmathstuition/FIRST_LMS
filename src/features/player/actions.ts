"use server";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";

/**
 * Player Server Actions. Progress writes are RLS-scoped to the current user;
 * marking a lesson complete triggers the DB rollup (enrollment progress →
 * completion → auto certificate, see 0002_functions.sql). No-ops in demo mode.
 */

export async function markLessonComplete(
  courseId: string,
  lessonId: string,
  completed: boolean,
): Promise<{ ok: boolean }> {
  if (!integrations.supabase) return { ok: true };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false };

    // Upsert on the (user_id, lesson_id) unique constraint.
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        completed,
      },
      { onConflict: "user_id,lesson_id" },
    );
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}

export async function saveLessonNote(
  courseId: string,
  lessonId: string,
  content: string,
  timestampSeconds?: number,
): Promise<{ ok: boolean }> {
  if (!content.trim()) return { ok: false };
  if (!integrations.supabase) return { ok: true };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false };

    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      lesson_id: lessonId,
      content: content.trim(),
      timestamp_seconds: timestampSeconds ?? null,
    });
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}
