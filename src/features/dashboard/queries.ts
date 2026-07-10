import "server-only";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";
import type {
  AchievementBadge,
  ActivityItem,
  CertificateItem,
  EnrolledCourse,
  NotificationItem,
  StudentStats,
  CourseCard,
} from "@/types";
import {
  demoActivity,
  demoBadges,
  demoCertificates,
  demoEnrolledCourses,
  demoNotifications,
  demoStats,
  demoWishlist,
} from "./demo-data";

/**
 * Student dashboard data access.
 *
 * When Supabase isn't configured we serve curated demo data so the whole
 * dashboard is populated and demonstrable. When it IS configured we read the
 * signed-in user's real rows (RLS ensures they only ever see their own),
 * degrading to empty states — never demo data — so live views are truthful.
 */

/* ------------------------------ enrollments ------------------------------- */

export async function getEnrolledCourses(
  userId: string,
): Promise<EnrolledCourse[]> {
  if (!integrations.supabase) return demoEnrolledCourses;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `progress_pct, status, created_at,
         course:course_id (
           id, slug, title, subtitle, thumbnail_url, level, price, currency,
           discount_price, rating_avg, rating_count, student_count,
           duration_minutes, lesson_count,
           categories:category_id ( id, name, slug ),
           instructor:instructor_id ( id, full_name, headline, avatar_url )
         )`,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return (data as unknown as EnrollmentRow[])
      .filter((row) => row.course)
      .map((row) => ({
        ...mapCourse(row.course!),
        progressPct: Number(row.progress_pct ?? 0),
        completedLessons: Math.round(
          (Number(row.progress_pct ?? 0) / 100) * (row.course!.lesson_count ?? 0),
        ),
        status: row.status,
        lastLessonTitle: null,
        enrolledAt: row.created_at,
      }));
  } catch {
    return [];
  }
}

export async function getWishlist(userId: string): Promise<CourseCard[]> {
  if (!integrations.supabase) return demoWishlist;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wishlists")
      .select(
        `course:course_id (
           id, slug, title, subtitle, thumbnail_url, level, price, currency,
           discount_price, rating_avg, rating_count, student_count,
           duration_minutes, lesson_count,
           categories:category_id ( id, name, slug ),
           instructor:instructor_id ( id, full_name, headline, avatar_url )
         )`,
      )
      .eq("user_id", userId);

    if (error || !data) return [];
    return (data as unknown as { course: CourseRow | null }[])
      .filter((r) => r.course)
      .map((r) => mapCourse(r.course!));
  } catch {
    return [];
  }
}

/* -------------------------------- stats ----------------------------------- */

export async function getStudentStats(userId: string): Promise<StudentStats> {
  if (!integrations.supabase) return demoStats;

  try {
    const enrolled = await getEnrolledCourses(userId);
    const completed = enrolled.filter((c) => c.status === "completed");
    const minutes = enrolled.reduce(
      (sum, c) => sum + (c.durationMinutes * c.progressPct) / 100,
      0,
    );

    const supabase = await createClient();
    const [{ data: profile }, { count: certCount }, { data: streak }] =
      await Promise.all([
        supabase.from("profiles").select("xp_points").eq("id", userId).single(),
        supabase
          .from("certificates")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("streaks")
          .select("current_days")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

    return {
      coursesEnrolled: enrolled.length,
      coursesCompleted: completed.length,
      hoursLearned: Math.round(minutes / 60),
      certificatesEarned: certCount ?? 0,
      currentStreak:
        (streak as { current_days?: number } | null)?.current_days ?? 0,
      xpPoints: (profile as { xp_points?: number } | null)?.xp_points ?? 0,
    };
  } catch {
    return {
      coursesEnrolled: 0,
      coursesCompleted: 0,
      hoursLearned: 0,
      certificatesEarned: 0,
      currentStreak: 0,
      xpPoints: 0,
    };
  }
}

/* ----------------------------- certificates ------------------------------- */

export async function getCertificates(
  userId: string,
): Promise<CertificateItem[]> {
  if (!integrations.supabase) return demoCertificates;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("certificates")
      .select(
        `id, certificate_number, verification_token, issued_at,
         course:course_id ( title, slug )`,
      )
      .eq("user_id", userId)
      .order("issued_at", { ascending: false });

    if (error || !data) return [];
    return (data as unknown as CertificateRow[]).map((row) => ({
      id: row.id,
      certificateNumber: row.certificate_number,
      verificationToken: row.verification_token,
      courseTitle: row.course?.title ?? "Course",
      courseSlug: row.course?.slug ?? "",
      issuedAt: row.issued_at,
    }));
  } catch {
    return [];
  }
}

/* ------------------------------- badges ----------------------------------- */

export async function getBadges(userId: string): Promise<AchievementBadge[]> {
  if (!integrations.supabase) return demoBadges;

  try {
    const supabase = await createClient();
    const [{ data: allBadges }, { data: earned }] = await Promise.all([
      supabase.from("badges").select("id, slug, name, description, icon"),
      supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", userId),
    ]);

    if (!allBadges) return [];
    const earnedMap = new Map(
      ((earned as { badge_id: string; earned_at: string }[]) ?? []).map((e) => [
        e.badge_id,
        e.earned_at,
      ]),
    );
    return (allBadges as BadgeRow[]).map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      description: b.description ?? "",
      icon: b.icon ?? "Award",
      earned: earnedMap.has(b.id),
      earnedAt: earnedMap.get(b.id) ?? null,
    }));
  } catch {
    return [];
  }
}

/* ------------------------- activity & notifications ----------------------- */

export async function getRecentActivity(
  _userId: string,
): Promise<ActivityItem[]> {
  // Activity is a derived feed; the aggregation query lands in a later phase.
  if (!integrations.supabase) return demoActivity;
  return [];
}

export async function getNotifications(
  userId: string,
): Promise<NotificationItem[]> {
  if (!integrations.supabase) return demoNotifications;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !data) return [];
    return (data as unknown as NotificationRow[]).map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      link: n.link,
      read: n.read_at != null,
      at: n.created_at,
    }));
  } catch {
    return [];
  }
}

/* ------------------------------- helpers ---------------------------------- */

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
  categories: { id: string; name: string; slug: string } | null;
  instructor: {
    id: string;
    full_name: string | null;
    headline: string | null;
    avatar_url: string | null;
  } | null;
};

type EnrollmentRow = {
  progress_pct: number | null;
  status: EnrolledCourse["status"];
  created_at: string;
  course: CourseRow | null;
};

type CertificateRow = {
  id: string;
  certificate_number: string;
  verification_token: string;
  issued_at: string;
  course: { title: string; slug: string } | null;
};

type BadgeRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
};

type NotificationRow = {
  id: string;
  type: NotificationItem["type"];
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

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
  };
}
