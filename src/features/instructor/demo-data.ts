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
  { id: "s1", name: "Kwame Osei", avatarUrl: null, courseTitle: "Mathematics Made Simple", progressPct: 62, enrolledAt: daysAgo(21) },
  { id: "s2", name: "Amara Nwosu", avatarUrl: null, courseTitle: "Coding for Kids: Scratch to Python", progressPct: 28, enrolledAt: daysAgo(12) },
  { id: "s3", name: "Daniel Park", avatarUrl: null, courseTitle: "Data Analysis for Beginners", progressPct: 84, enrolledAt: daysAgo(40) },
  { id: "s4", name: "Sofia Rossi", avatarUrl: null, courseTitle: "Web Development Foundations", progressPct: 100, enrolledAt: daysAgo(55) },
  { id: "s5", name: "Liam Walsh", avatarUrl: null, courseTitle: "Mathematics Made Simple", progressPct: 15, enrolledAt: daysAgo(5) },
  { id: "s6", name: "Zainab Ali", avatarUrl: null, courseTitle: "Tech in Teaching: The Digital Classroom", progressPct: 47, enrolledAt: daysAgo(9) },
];

export const demoReviews: ReviewRow[] = [
  { id: "r1", studentName: "Kwame Osei", studentAvatar: null, courseTitle: "Mathematics Made Simple", rating: 5, content: "Finally understand math. The visual approach is brilliant!", at: daysAgo(2), replied: false },
  { id: "r2", studentName: "Amara Nwosu", studentAvatar: null, courseTitle: "Coding for Kids: Scratch to Python", rating: 5, content: "My child loves it — so practical and fun.", at: daysAgo(4), replied: true },
  { id: "r3", studentName: "Daniel Park", studentAvatar: null, courseTitle: "Data Analysis for Beginners", rating: 4, content: "Great content — would love more real datasets.", at: daysAgo(6), replied: false },
  { id: "r4", studentName: "Sofia Rossi", studentAvatar: null, courseTitle: "Web Development Foundations", rating: 5, content: "Beautifully taught. Everything just clicks.", at: daysAgo(11), replied: false },
];

export const demoEarnings: EarningTxn[] = [
  { id: "e1", courseTitle: "Coding for Kids: Scratch to Python", student: "Amara Nwosu", gross: 3000, net: 2550, at: daysAgo(0) },
  { id: "e2", courseTitle: "Mathematics Made Simple", student: "Liam Walsh", gross: 2500, net: 2125, at: daysAgo(1) },
  { id: "e3", courseTitle: "Data Analysis for Beginners", student: "Daniel Park", gross: 5000, net: 4250, at: daysAgo(2) },
  { id: "e4", courseTitle: "Tech in Teaching: The Digital Classroom", student: "Zainab Ali", gross: 2500, net: 2125, at: daysAgo(3) },
  { id: "e5", courseTitle: "Mathematics Made Simple", student: "Kwame Osei", gross: 2500, net: 2125, at: daysAgo(5) },
];

export const demoMessages: MessageThread[] = [
  { id: "m1", fromName: "Kwame Osei", fromAvatar: null, courseTitle: "Mathematics Made Simple", preview: "Hi! I'm stuck on the algebra lesson — could you clarify…", at: daysAgo(0), unread: true },
  { id: "m2", fromName: "Amara Nwosu", fromAvatar: null, courseTitle: "Coding for Kids", preview: "Thank you so much, that explanation really helped!", at: daysAgo(1), unread: true },
  { id: "m3", fromName: "Daniel Park", fromAvatar: null, courseTitle: "Data Analysis for Beginners", preview: "Will there be a module on data visualization?", at: daysAgo(3), unread: false },
];
