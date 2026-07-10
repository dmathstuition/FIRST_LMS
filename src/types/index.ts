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
