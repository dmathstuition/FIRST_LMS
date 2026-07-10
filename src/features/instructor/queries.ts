import "server-only";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";
import type { CourseCard } from "@/types";
import type {
  CourseDetail,
  EarningTxn,
  InstructorCourse,
  InstructorStats,
  MessageThread,
  ReviewRow,
  SeriesPoint,
  StudentRow,
} from "./types";
import {
  demoEarnings,
  demoEnrollmentSeries,
  demoInstructorCourses,
  demoInstructorStats,
  demoMessages,
  demoReviews,
  demoRevenueSeries,
  demoStudents,
} from "./demo-data";

/**
 * Instructor panel data access.
 *
 * Demo data when Supabase isn't configured; otherwise the signed-in
 * instructor's own rows (RLS + `owns_course()` guarantee isolation), degrading
 * to empty states — never demo data — for truthful live views.
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
  status: "draft" | "published" | "archived";
  rating_avg: number;
  rating_count: number;
  student_count: number;
  duration_minutes: number;
  lesson_count: number;
  category: { id: string; name: string; slug: string } | null;
};

function mapInstructorCourse(row: CourseRow): InstructorCourse {
  const price = row.discount_price != null ? Number(row.discount_price) : Number(row.price);
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
    category: row.category,
    instructor: null,
    status: row.status,
    revenue: Math.round(price * row.student_count * 0.6),
    monthEnrollments: 0,
  };
}

export async function getInstructorCourses(
  userId: string,
): Promise<InstructorCourse[]> {
  if (!integrations.supabase) return demoInstructorCourses;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select(
        `id, slug, title, subtitle, thumbnail_url, level, price, currency,
         discount_price, status, rating_avg, rating_count, student_count,
         duration_minutes, lesson_count,
         category:category_id ( id, name, slug )`,
      )
      .eq("instructor_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as unknown as CourseRow[]).map(mapInstructorCourse);
  } catch {
    return [];
  }
}

/** Load a single owned course with its full curriculum for the builder. */
export async function getInstructorCourseDetail(
  courseId: string,
): Promise<CourseDetail | null> {
  if (!integrations.supabase) {
    const course = demoInstructorCourses.find((c) => c.id === courseId);
    if (!course) return null;
    // Illustrative curriculum for the demo builder.
    return {
      course,
      sections: [
        {
          id: "demo-s1",
          title: "Getting Started",
          lessons: [
            { id: "demo-l1", title: "Welcome & course overview", type: "video", durationMinutes: 6, isPreview: true },
            { id: "demo-l2", title: "How to get the most out of this course", type: "text", durationMinutes: 4, isPreview: false },
          ],
        },
        {
          id: "demo-s2",
          title: "Core Concepts",
          lessons: [
            { id: "demo-l3", title: "The big idea", type: "video", durationMinutes: 12, isPreview: false },
          ],
        },
      ],
    };
  }

  try {
    const supabase = await createClient();
    const { data: course, error } = await supabase
      .from("courses")
      .select(
        `id, slug, title, subtitle, thumbnail_url, level, price, currency,
         discount_price, status, rating_avg, rating_count, student_count,
         duration_minutes, lesson_count, description, category_id,
         category:category_id ( id, name, slug )`,
      )
      .eq("id", courseId)
      .single();

    if (error || !course) return null;

    const { data: sections } = await supabase
      .from("sections")
      .select(
        `id, title, sort_order,
         lessons ( id, title, type, duration_minutes, is_preview, sort_order )`,
      )
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });

    const mappedSections = ((sections as unknown as SectionRow[]) ?? []).map(
      (s) => ({
        id: s.id,
        title: s.title,
        lessons: [...(s.lessons ?? [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((l) => ({
            id: l.id,
            title: l.title,
            type: l.type,
            durationMinutes: l.duration_minutes,
            isPreview: l.is_preview,
          })),
      }),
    );

    return {
      course: mapInstructorCourse(course as unknown as CourseRow),
      sections: mappedSections,
    };
  } catch {
    return null;
  }
}

export async function getInstructorStats(
  userId: string,
): Promise<InstructorStats> {
  if (!integrations.supabase) return demoInstructorStats;

  try {
    const courses = await getInstructorCourses(userId);
    const totalStudents = courses.reduce((s, c) => s + c.studentCount, 0);
    const totalRevenue = courses.reduce((s, c) => s + c.revenue, 0);
    const rated = courses.filter((c) => c.ratingCount > 0);
    const avgRating =
      rated.length > 0
        ? rated.reduce((s, c) => s + c.ratingAvg, 0) / rated.length
        : 0;

    return {
      totalStudents,
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.status === "published").length,
      totalRevenue,
      monthRevenue: 0,
      avgRating: Math.round(avgRating * 10) / 10,
      pendingReviews: 0,
    };
  } catch {
    return {
      totalStudents: 0,
      totalCourses: 0,
      publishedCourses: 0,
      totalRevenue: 0,
      monthRevenue: 0,
      avgRating: 0,
      pendingReviews: 0,
    };
  }
}

export async function getInstructorStudents(
  userId: string,
): Promise<StudentRow[]> {
  if (!integrations.supabase) return demoStudents;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `progress_pct, created_at,
         student:user_id ( full_name, avatar_url ),
         course:course_id!inner ( title, instructor_id )`,
      )
      .eq("course.instructor_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data) return [];
    return (data as unknown as StudentEnrollmentRow[]).map((row, i) => ({
      id: `${i}`,
      name: row.student?.full_name ?? "Student",
      avatarUrl: row.student?.avatar_url ?? null,
      courseTitle: row.course?.title ?? "Course",
      progressPct: Number(row.progress_pct ?? 0),
      enrolledAt: row.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getInstructorReviews(
  userId: string,
): Promise<ReviewRow[]> {
  if (!integrations.supabase) return demoReviews;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `id, rating, content, created_at,
         student:user_id ( full_name, avatar_url ),
         course:course_id!inner ( title, instructor_id )`,
      )
      .eq("course.instructor_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return (data as unknown as ReviewJoinRow[]).map((row) => ({
      id: row.id,
      studentName: row.student?.full_name ?? "Student",
      studentAvatar: row.student?.avatar_url ?? null,
      courseTitle: row.course?.title ?? "Course",
      rating: row.rating,
      content: row.content,
      at: row.created_at,
      replied: false,
    }));
  } catch {
    return [];
  }
}

export async function getInstructorEarnings(
  _userId: string,
): Promise<EarningTxn[]> {
  // Full payout ledger arrives with live payments (Phase 9).
  if (!integrations.supabase) return demoEarnings;
  return [];
}

export async function getRevenueSeries(_userId: string): Promise<SeriesPoint[]> {
  if (!integrations.supabase) return demoRevenueSeries;
  return [];
}

export async function getEnrollmentSeries(
  _userId: string,
): Promise<SeriesPoint[]> {
  if (!integrations.supabase) return demoEnrollmentSeries;
  return [];
}

export async function getInstructorMessages(
  _userId: string,
): Promise<MessageThread[]> {
  if (!integrations.supabase) return demoMessages;
  return [];
}

/* -------------------------------- helpers --------------------------------- */

type StudentEnrollmentRow = {
  progress_pct: number | null;
  created_at: string;
  student: { full_name: string | null; avatar_url: string | null } | null;
  course: { title: string; instructor_id: string } | null;
};

type ReviewJoinRow = {
  id: string;
  rating: number;
  content: string | null;
  created_at: string;
  student: { full_name: string | null; avatar_url: string | null } | null;
  course: { title: string; instructor_id: string } | null;
};

type SectionRow = {
  id: string;
  title: string;
  sort_order: number;
  lessons:
    | {
        id: string;
        title: string;
        type: string;
        duration_minutes: number;
        is_preview: boolean;
        sort_order: number;
      }[]
    | null;
};
