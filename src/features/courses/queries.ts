import "server-only";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";
import type { Category, CourseCard } from "@/types";
import { demoCategories, demoCourses } from "./demo-data";

/**
 * Public catalog queries.
 *
 * When a real Supabase project is configured we read live data; otherwise we
 * return the curated demo dataset (mirrors seed.sql) so the marketing site is
 * fully populated out of the box. Any query error also degrades to demo data so
 * the landing page can never render empty.
 */

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnail_url: string | null;
  level: CourseCard["level"];
  price: number;
  currency: string;
  discount_price: number | null;
  rating_avg: number;
  rating_count: number;
  student_count: number;
  duration_minutes: number;
  lesson_count: number;
  is_featured: boolean;
  categories: { id: string; name: string; slug: string } | null;
  instructor: {
    id: string;
    full_name: string | null;
    headline: string | null;
    avatar_url: string | null;
  } | null;
};

const COURSE_SELECT = `
  id, slug, title, subtitle, thumbnail_url, level, price, currency,
  discount_price, rating_avg, rating_count, student_count, duration_minutes,
  lesson_count, is_featured,
  categories:category_id ( id, name, slug ),
  instructor:instructor_id ( id, full_name, headline, avatar_url )
`;

function mapCourse(row: CourseRow): CourseCard {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    thumbnailUrl: row.thumbnail_url,
    level: row.level,
    price: Number(row.price),
    currency: row.currency,
    discountPrice: row.discount_price != null ? Number(row.discount_price) : null,
    ratingAvg: Number(row.rating_avg),
    ratingCount: row.rating_count,
    studentCount: row.student_count,
    durationMinutes: row.duration_minutes,
    lessonCount: row.lesson_count,
    category: row.categories,
    instructor: row.instructor
      ? {
          id: row.instructor.id,
          fullName: row.instructor.full_name ?? "Instructor",
          headline: row.instructor.headline,
          avatarUrl: row.instructor.avatar_url,
        }
      : null,
    isFeatured: row.is_featured,
  };
}

/** Featured courses for the landing "Featured Courses" strip. */
export async function getFeaturedCourses(limit = 4): Promise<CourseCard[]> {
  if (!integrations.supabase) return demoCourses.filter((c) => c.isFeatured).slice(0, limit);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select(COURSE_SELECT)
      .eq("status", "published")
      .eq("is_featured", true)
      .order("student_count", { ascending: false })
      .limit(limit);

    if (error || !data?.length) {
      return demoCourses.filter((c) => c.isFeatured).slice(0, limit);
    }
    return (data as unknown as CourseRow[]).map(mapCourse);
  } catch {
    return demoCourses.filter((c) => c.isFeatured).slice(0, limit);
  }
}

/** All published courses for the catalog page. */
export async function getPublishedCourses(): Promise<CourseCard[]> {
  if (!integrations.supabase) return demoCourses;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select(COURSE_SELECT)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error || !data?.length) return demoCourses;
    return (data as unknown as CourseRow[]).map(mapCourse);
  } catch {
    return demoCourses;
  }
}

/** A single published course by slug (for the course detail page). */
export async function getCourseBySlug(slug: string): Promise<CourseCard | null> {
  if (!integrations.supabase) {
    return demoCourses.find((c) => c.slug === slug) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select(COURSE_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      return demoCourses.find((c) => c.slug === slug) ?? null;
    }
    return mapCourse(data as unknown as CourseRow);
  } catch {
    return demoCourses.find((c) => c.slug === slug) ?? null;
  }
}

/** Categories with a course count for the "Categories" section + filters. */
export async function getCategories(): Promise<Category[]> {
  if (!integrations.supabase) return demoCategories;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, icon")
      .order("sort_order", { ascending: true });

    if (error || !data?.length) return demoCategories;
    return data as Category[];
  } catch {
    return demoCategories;
  }
}
