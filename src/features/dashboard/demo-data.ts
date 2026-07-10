import { demoCourses } from "@/features/courses/demo-data";
import type {
  AchievementBadge,
  ActivityItem,
  CertificateItem,
  EnrolledCourse,
  NotificationItem,
  StudentStats,
} from "@/types";

/**
 * Curated demo dashboard content.
 *
 * Used when Supabase isn't connected (integrations.supabase === false) OR when a
 * connected user has no data yet, so the student dashboard is fully populated
 * and demonstrable out of the box. Mirrors the shape of the live queries.
 */

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

// Attach progress to a few of the seed courses to represent enrollments.
export const demoEnrolledCourses: EnrolledCourse[] = [
  {
    ...demoCourses[0], // Calculus Made Intuitive
    progressPct: 62,
    completedLessons: Math.round(demoCourses[0].lessonCount * 0.62),
    status: "active",
    lastLessonTitle: "The Derivative as a Rate of Change",
    enrolledAt: daysAgo(21),
  },
  {
    ...demoCourses[1], // Full-Stack Next.js
    progressPct: 28,
    completedLessons: Math.round(demoCourses[1].lessonCount * 0.28),
    status: "active",
    lastLessonTitle: "Server Actions & Mutations",
    enrolledAt: daysAgo(12),
  },
  {
    ...demoCourses[3], // Linear Algebra for ML
    progressPct: 100,
    completedLessons: demoCourses[3].lessonCount,
    status: "completed",
    lastLessonTitle: "Singular Value Decomposition",
    enrolledAt: daysAgo(60),
  },
  {
    ...demoCourses[5], // SAT Math Mastery
    progressPct: 8,
    completedLessons: Math.round(demoCourses[5].lessonCount * 0.08),
    status: "active",
    lastLessonTitle: "Heart of Algebra: Linear Equations",
    enrolledAt: daysAgo(3),
  },
];

export const demoWishlist = [demoCourses[2], demoCourses[4]];

export const demoStats: StudentStats = {
  coursesEnrolled: demoEnrolledCourses.length,
  coursesCompleted: demoEnrolledCourses.filter((c) => c.status === "completed")
    .length,
  hoursLearned: 47,
  certificatesEarned: 1,
  currentStreak: 6,
  xpPoints: 2480,
};

export const demoCertificates: CertificateItem[] = [
  {
    id: "cert-1",
    certificateNumber: "D-MATHS-2026-A1B2C3D4",
    verificationToken: "demo",
    courseTitle: "Linear Algebra for Machine Learning",
    courseSlug: "linear-algebra-for-ml",
    issuedAt: daysAgo(5),
  },
];

export const demoBadges: AchievementBadge[] = [
  {
    id: "b1",
    slug: "first-course",
    name: "First Steps",
    description: "Enrolled in your first course",
    icon: "Rocket",
    earned: true,
    earnedAt: daysAgo(60),
  },
  {
    id: "b2",
    slug: "course-complete",
    name: "Finisher",
    description: "Completed a course",
    icon: "Trophy",
    earned: true,
    earnedAt: daysAgo(5),
  },
  {
    id: "b3",
    slug: "streak-7",
    name: "On Fire",
    description: "Maintain a 7-day learning streak",
    icon: "Flame",
    earned: false,
    earnedAt: null,
  },
  {
    id: "b4",
    slug: "quiz-ace",
    name: "Quiz Ace",
    description: "Score 100% on a quiz",
    icon: "Target",
    earned: true,
    earnedAt: daysAgo(9),
  },
  {
    id: "b5",
    slug: "night-owl",
    name: "Night Owl",
    description: "Complete lessons after midnight",
    icon: "Moon",
    earned: false,
    earnedAt: null,
  },
  {
    id: "b6",
    slug: "scholar",
    name: "Scholar",
    description: "Earn 5,000 XP",
    icon: "GraduationCap",
    earned: false,
    earnedAt: null,
  },
];

export const demoActivity: ActivityItem[] = [
  {
    id: "a1",
    type: "lesson",
    title: "Completed “The Derivative as a Rate of Change”",
    courseTitle: "Calculus Made Intuitive",
    at: daysAgo(0),
  },
  {
    id: "a2",
    type: "quiz",
    title: "Scored 92% on “Limits Quiz”",
    courseTitle: "Calculus Made Intuitive",
    at: daysAgo(1),
  },
  {
    id: "a3",
    type: "certificate",
    title: "Earned a certificate",
    courseTitle: "Linear Algebra for Machine Learning",
    at: daysAgo(5),
  },
  {
    id: "a4",
    type: "enrollment",
    title: "Enrolled in a new course",
    courseTitle: "SAT Math Mastery",
    at: daysAgo(3),
  },
  {
    id: "a5",
    type: "badge",
    title: "Unlocked the “Quiz Ace” badge",
    courseTitle: null,
    at: daysAgo(9),
  },
];

export const demoNotifications: NotificationItem[] = [
  {
    id: "n1",
    type: "course",
    title: "New lesson added",
    body: "“Advanced Integration Techniques” was added to Calculus Made Intuitive.",
    link: "/courses/calculus-made-intuitive",
    read: false,
    at: daysAgo(0),
  },
  {
    id: "n2",
    type: "achievement",
    title: "Achievement unlocked 🎉",
    body: "You earned the “Finisher” badge for completing a course.",
    link: "/dashboard/achievements",
    read: false,
    at: daysAgo(5),
  },
  {
    id: "n3",
    type: "payment",
    title: "Payment receipt",
    body: "Your receipt for Linear Algebra for Machine Learning is ready.",
    link: "/dashboard/purchases",
    read: true,
    at: daysAgo(60),
  },
];
