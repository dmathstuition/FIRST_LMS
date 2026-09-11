"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { integrations } from "@/lib/env";

/**
 * Review Server Actions. Writes are gated by the "Enrolled users write reviews"
 * RLS policy, so only enrolled students can post — invoking this without an
 * enrollment fails at the database. The course rating aggregate updates via the
 * trg_reviews_rating trigger.
 */

export type ReviewActionState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  title: z.string().max(120).optional().or(z.literal("")),
  content: z.string().max(2000).optional().or(z.literal("")),
});

/** Create or update the current user's review for a course. */
export async function submitReview(
  courseId: string,
  courseSlug: string,
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!integrations.supabase) {
    return { ok: true, message: "Review saved. (Connect Supabase to persist.)" };
  }

  const user = await getSessionUser();
  if (!user) return { ok: false, message: "Please sign in to leave a review." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("reviews").upsert(
      {
        course_id: courseId,
        user_id: user.id,
        rating: parsed.data.rating,
        title: parsed.data.title || null,
        content: parsed.data.content || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "course_id,user_id" },
    );
    if (error) {
      // The most common cause is the RLS check failing (not enrolled).
      return {
        ok: false,
        message:
          "Only enrolled students can review this course. Enroll first, then share your thoughts.",
      };
    }
  } catch {
    return { ok: false, message: "Could not save your review." };
  }

  revalidatePath(`/courses/${courseSlug}`);
  return { ok: true, message: "Thanks! Your review has been posted." };
}

/** Delete the current user's review for a course. */
export async function deleteReview(courseId: string, courseSlug: string) {
  if (!integrations.supabase) return;
  const user = await getSessionUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("reviews")
    .delete()
    .eq("course_id", courseId)
    .eq("user_id", user.id);
  revalidatePath(`/courses/${courseSlug}`);
}
