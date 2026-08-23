/**
 * Shared domain types used across the UI layer.
 *
 * These are hand-authored, view-friendly shapes. The raw, table-accurate types
 * live in `database.types.ts` (regenerate with `npm run db:types`). Keeping a
 * curated layer here decouples components from column-level churn.
 */

export type UserRole = "student" | "instructor" | "admin";

export type CourseLevel = "beginner" | "intermediate" | "advanced" | "all";

export type LessonType =
  | "video"
  | "text"
  | "markdown"
  | "pdf"
  | "audio"
  | "slides"
  | "code"
  | "embed"
  | "youtube"
  | "vimeo";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  courseCount?: number;
}

export interface InstructorSummary {
  id: string;
  fullName: string;
  headline: string | null;
  avatarUrl: string | null;
}

export interface CourseCard {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  level: CourseLevel;
  price: number;
  currency: string;
  discountPrice: number | null;
  ratingAvg: number;
  ratingCount: number;
  studentCount: number;
  durationMinutes: number;
  lessonCount: number;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  instructor: InstructorSummary | null;
  isFeatured?: boolean;
  isBestseller?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  quote: string;
  rating: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

/* -------------------------------------------------------------------------- */
/*  Student dashboard                                                          */
/* -------------------------------------------------------------------------- */

export type EnrollmentStatus = "active" | "completed" | "refunded" | "cancelled";

/** A course the current user is enrolled in, with their progress attached. */
export interface EnrolledCourse extends CourseCard {
  progressPct: number;
  completedLessons: number;
  status: EnrollmentStatus;
  lastLessonTitle: string | null;
  enrolledAt: string;
}

/** Headline metrics for the dashboard home. */
export interface StudentStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  hoursLearned: number;
  certificatesEarned: number;
  currentStreak: number;
  xpPoints: number;
}

export interface CertificateItem {
  id: string;
  certificateNumber: string;
  verificationToken: string;
  courseTitle: string;
  courseSlug: string;
  issuedAt: string;
}

export interface Purchase {
  id: string;
  courseTitle: string;
  courseSlug: string | null;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  reference: string | null;
  provider: string | null;
  at: string;
}

export interface AchievementBadge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
}

export interface ActivityItem {
  id: string;
  type: "lesson" | "quiz" | "certificate" | "enrollment" | "badge";
  title: string;
  courseTitle: string | null;
  at: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationKind;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  at: string;
}

export type NotificationKind =
  | "system"
  | "course"
  | "payment"
  | "assignment"
  | "quiz"
  | "message"
  | "achievement";
