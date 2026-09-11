import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { integrations } from "@/lib/env";

/**
 * Course review queries. Reviews are public to read; only enrolled users may
 * write one (enforced by RLS). The course's rating_avg / rating_count are kept
 * in sync automatically by the trg_reviews_rating trigger.
 */

export type CourseReview = {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  createdAt: string;
  author: { fullName: string | null; avatarUrl: string | null } | null;
};

type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  author: { full_name: string | null; avatar_url: string | null } | null;
};

const REVIEW_SELECT = `
  id, rating, title, content, created_at,
  author:user_id ( full_name, avatar_url )
`;

/** All reviews for a course, newest first. */
export async function getCourseReviews(courseId: string): Promise<CourseReview[]> {
  if (!integrations.supabase) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select(REVIEW_SELECT)
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as ReviewRow[]).map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      createdAt: r.created_at,
      author: r.author
        ? { fullName: r.author.full_name, avatarUrl: r.author.avatar_url }
        : null,
    }));
  } catch {
    return [];
  }
}

export type ReviewContext = {
  canReview: boolean;
  signedIn: boolean;
  existing: { rating: number; title: string | null; content: string | null } | null;
};

/**
 * Whether the current visitor may review this course, and their existing
 * review (if any) so the form can pre-fill for editing.
 */
export async function getReviewContext(courseId: string): Promise<ReviewContext> {
  const empty: ReviewContext = { canReview: false, signedIn: false, existing: null };
  if (!integrations.supabase) return empty;

  const user = await getSessionUser();
  if (!user) return empty;

  try {
    const supabase = await createClient();
    const [{ data: enrollment }, { data: review }] = await Promise.all([
      supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle(),
      supabase
        .from("reviews")
        .select("rating, title, content")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle(),
    ]);

    const existing = review
      ? (review as { rating: number; title: string | null; content: string | null })
      : null;

    return {
      canReview: !!enrollment,
      signedIn: true,
      existing,
    };
  } catch {
    return { canReview: false, signedIn: true, existing: null };
  }
}
