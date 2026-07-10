import { demoCourses } from "@/features/courses/demo-data";
import type {
  EarningTxn,
  InstructorCourse,
  InstructorStats,
  MessageThread,
  ReviewRow,
  SeriesPoint,
  StudentRow,
} from "./types";

/**
 * Curated demo data for the instructor panel — used when Supabase isn't
 * connected so the whole panel is populated and demonstrable. Mirrors the shape
 * of the live queries in queries.ts.
 */

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

// Treat the demo instructor's seeded courses as their catalog.
export const demoInstructorCourses: InstructorCourse[] = demoCourses.map(
  (c, i) => ({
    ...c,
    status: i === demoCourses.length - 1 ? "draft" : "published",
    revenue: Math.round((c.discountPrice ?? c.price) * c.studentCount * 0.6),
    monthEnrollments: [420, 610, 280, 190, 240, 90][i] ?? 120,
  }),
);

const totalStudents = demoInstructorCourses.reduce(
  (s, c) => s + c.studentCount,
  0,
);
const totalRevenue = demoInstructorCourses.reduce((s, c) => s + c.revenue, 0);

export const demoInstructorStats: InstructorStats = {
  totalStudents,
  totalCourses: demoInstructorCourses.length,
  publishedCourses: demoInstructorCourses.filter((c) => c.status === "published")
    .length,
  totalRevenue,
  monthRevenue: 18420,
  avgRating: 4.8,
  pendingReviews: 3,
};

export const demoRevenueSeries: SeriesPoint[] = [
  { label: "Jan", value: 9200 },
  { label: "Feb", value: 11800 },
  { label: "Mar", value: 10400 },
  { label: "Apr", value: 14300 },
  { label: "May", value: 16100 },
  { label: "Jun", value: 15200 },
  { label: "Jul", value: 18420 },
];

export const demoEnrollmentSeries: SeriesPoint[] = [
  { label: "Jan", value: 320 },
  { label: "Feb", value: 410 },
  { label: "Mar", value: 380 },
  { label: "Apr", value: 520 },
  { label: "May", value: 610 },
  { label: "Jun", value: 560 },
  { label: "Jul", value: 690 },
];

export const demoStudents: StudentRow[] = [
  { id: "s1", name: "Kwame Osei", avatarUrl: null, courseTitle: "Calculus Made Intuitive", progressPct: 62, enrolledAt: daysAgo(21) },
  { id: "s2", name: "Amara Nwosu", avatarUrl: null, courseTitle: "Full-Stack Web Development with Next.js 15", progressPct: 28, enrolledAt: daysAgo(12) },
  { id: "s3", name: "Daniel Park", avatarUrl: null, courseTitle: "Data Science with Python", progressPct: 84, enrolledAt: daysAgo(40) },
  { id: "s4", name: "Sofia Rossi", avatarUrl: null, courseTitle: "UI/UX Design Foundations", progressPct: 100, enrolledAt: daysAgo(55) },
  { id: "s5", name: "Liam Walsh", avatarUrl: null, courseTitle: "Calculus Made Intuitive", progressPct: 15, enrolledAt: daysAgo(5) },
  { id: "s6", name: "Zainab Ali", avatarUrl: null, courseTitle: "SAT Math Mastery", progressPct: 47, enrolledAt: daysAgo(9) },
];

export const demoReviews: ReviewRow[] = [
  { id: "r1", studentName: "Kwame Osei", studentAvatar: null, courseTitle: "Calculus Made Intuitive", rating: 5, content: "Finally understand calculus. The visual approach is brilliant!", at: daysAgo(2), replied: false },
  { id: "r2", studentName: "Amara Nwosu", studentAvatar: null, courseTitle: "Full-Stack Web Development with Next.js 15", rating: 5, content: "Shipped a real product before finishing. Incredibly practical.", at: daysAgo(4), replied: true },
  { id: "r3", studentName: "Daniel Park", studentAvatar: null, courseTitle: "Data Science with Python", rating: 4, content: "Great content — would love more on deep learning.", at: daysAgo(6), replied: false },
  { id: "r4", studentName: "Sofia Rossi", studentAvatar: null, courseTitle: "UI/UX Design Foundations", rating: 5, content: "Beautifully taught. Landed interviews within weeks.", at: daysAgo(11), replied: false },
];

export const demoEarnings: EarningTxn[] = [
  { id: "e1", courseTitle: "Full-Stack Web Development with Next.js 15", student: "Amara Nwosu", gross: 79.99, net: 63.99, at: daysAgo(0) },
  { id: "e2", courseTitle: "Calculus Made Intuitive", student: "Liam Walsh", gross: 49.99, net: 39.99, at: daysAgo(1) },
  { id: "e3", courseTitle: "Data Science with Python", student: "Daniel Park", gross: 109.99, net: 87.99, at: daysAgo(2) },
  { id: "e4", courseTitle: "SAT Math Mastery", student: "Zainab Ali", gross: 69.99, net: 55.99, at: daysAgo(3) },
  { id: "e5", courseTitle: "Calculus Made Intuitive", student: "Kwame Osei", gross: 49.99, net: 39.99, at: daysAgo(5) },
];

export const demoMessages: MessageThread[] = [
  { id: "m1", fromName: "Kwame Osei", fromAvatar: null, courseTitle: "Calculus Made Intuitive", preview: "Hi! I'm stuck on the chain rule lesson — could you clarify…", at: daysAgo(0), unread: true },
  { id: "m2", fromName: "Amara Nwosu", fromAvatar: null, courseTitle: "Full-Stack Web Development", preview: "Thank you so much, that fixed my deployment issue!", at: daysAgo(1), unread: true },
  { id: "m3", fromName: "Daniel Park", fromAvatar: null, courseTitle: "Data Science with Python", preview: "Will there be a module on time-series forecasting?", at: daysAgo(3), unread: false },
];
