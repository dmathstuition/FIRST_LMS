import type { CourseCard, CourseLevel } from "@/types";

/** A course owned by the instructor, with teaching metrics attached. */
export interface InstructorCourse extends CourseCard {
  status: "draft" | "published" | "archived";
  revenue: number;
  monthEnrollments: number;
}

export interface InstructorStats {
  totalStudents: number;
  totalCourses: number;
  publishedCourses: number;
  totalRevenue: number;
  monthRevenue: number;
  avgRating: number;
  pendingReviews: number;
}

/** A point in a time-series (revenue or enrollments per month). */
export interface SeriesPoint {
  label: string;
  value: number;
}

export interface StudentRow {
  id: string;
  name: string;
  avatarUrl: string | null;
  courseTitle: string;
  progressPct: number;
  enrolledAt: string;
}

export interface ReviewRow {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  courseTitle: string;
  rating: number;
  content: string | null;
  at: string;
  replied: boolean;
}

export interface EarningTxn {
  id: string;
  courseTitle: string;
  student: string;
  gross: number;
  net: number;
  at: string;
}

export interface MessageThread {
  id: string;
  fromName: string;
  fromAvatar: string | null;
  courseTitle: string | null;
  preview: string;
  at: string;
  unread: boolean;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
  isPreview: boolean;
}

export interface CurriculumSection {
  id: string;
  title: string;
  lessons: CurriculumLesson[];
}

export interface CourseDetail {
  course: InstructorCourse;
  sections: CurriculumSection[];
}

/** Draft shape used by the course create/edit form (client-side). */
export interface CourseDraft {
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  level: CourseLevel;
  price: number;
  thumbnailUrl: string;
}
