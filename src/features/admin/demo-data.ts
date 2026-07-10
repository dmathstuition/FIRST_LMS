import { demoCourses, demoCategories } from "@/features/courses/demo-data";
import type {
  AdminAuditRow,
  AdminCategoryRow,
  AdminCourseRow,
  AdminCouponRow,
  AdminOrderRow,
  AdminStats,
  AdminTicketRow,
  AdminUserRow,
  SeriesPoint,
  SiteSettings,
} from "./types";

/** Curated demo data for the admin panel (used when Supabase isn't connected). */

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const demoAdminStats: AdminStats = {
  totalRevenue: 3558567,
  totalSales: 84210,
  totalStudents: 85400,
  totalInstructors: 214,
  totalCourses: demoCourses.length,
  publishedCourses: demoCourses.length - 1,
  newUsersThisMonth: 4820,
  openTickets: 7,
};

export const demoRevenueSeries: SeriesPoint[] = [
  { label: "Jan", value: 284000 },
  { label: "Feb", value: 312000 },
  { label: "Mar", value: 298000 },
  { label: "Apr", value: 361000 },
  { label: "May", value: 402000 },
  { label: "Jun", value: 388000 },
  { label: "Jul", value: 451000 },
];

export const demoSignupSeries: SeriesPoint[] = [
  { label: "Jan", value: 3200 },
  { label: "Feb", value: 4100 },
  { label: "Mar", value: 3850 },
  { label: "Apr", value: 5200 },
  { label: "May", value: 6100 },
  { label: "Jun", value: 5600 },
  { label: "Jul", value: 6900 },
];

export const demoUsers: AdminUserRow[] = [
  { id: "u1", name: "Dr. Ada Mensah", email: "instructor@dmaths.io", role: "instructor", avatarUrl: null, joinedAt: daysAgo(400), xp: 0 },
  { id: "u2", name: "Kwame Osei", email: "kwame@example.com", role: "student", avatarUrl: null, joinedAt: daysAgo(21), xp: 2480 },
  { id: "u3", name: "Amara Nwosu", email: "amara@example.com", role: "student", avatarUrl: null, joinedAt: daysAgo(12), xp: 1320 },
  { id: "u4", name: "Daniel Park", email: "daniel@example.com", role: "student", avatarUrl: null, joinedAt: daysAgo(40), xp: 3890 },
  { id: "u5", name: "Sofia Rossi", email: "sofia@example.com", role: "student", avatarUrl: null, joinedAt: daysAgo(55), xp: 5210 },
  { id: "u6", name: "Marcus Lee", email: "marcus@example.com", role: "instructor", avatarUrl: null, joinedAt: daysAgo(120), xp: 0 },
  { id: "u7", name: "Site Admin", email: "admin@dmaths.io", role: "admin", avatarUrl: null, joinedAt: daysAgo(500), xp: 0 },
];

export const demoAdminCourses: AdminCourseRow[] = demoCourses.map((c, i) => ({
  id: c.id,
  title: c.title,
  slug: c.slug,
  instructorName: c.instructor?.fullName ?? "Instructor",
  categoryName: c.category?.name ?? null,
  status: i === demoCourses.length - 1 ? "draft" : "published",
  studentCount: c.studentCount,
  price: c.price,
  isFeatured: !!c.isFeatured,
  createdAt: daysAgo(30 + i * 10),
}));

export const demoAdminCategories: AdminCategoryRow[] = demoCategories.map(
  (c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    courseCount: c.courseCount ?? 0,
  }),
);

export const demoCoupons: AdminCouponRow[] = [
  { id: "c1", code: "WELCOME20", discountType: "percent", amount: 20, redemptions: 1240, maxRedemptions: null, expiresAt: null, active: true },
  { id: "c2", code: "BLACKFRIDAY", discountType: "percent", amount: 50, redemptions: 3820, maxRedemptions: 5000, expiresAt: daysAgo(-30), active: true },
  { id: "c3", code: "STUDENT10", discountType: "fixed", amount: 10, redemptions: 640, maxRedemptions: 1000, expiresAt: daysAgo(-90), active: true },
  { id: "c4", code: "LAUNCH", discountType: "percent", amount: 30, redemptions: 500, maxRedemptions: 500, expiresAt: daysAgo(60), active: false },
];

export const demoOrders: AdminOrderRow[] = [
  { id: "o1", userName: "Amara Nwosu", total: 79.99, currency: "USD", status: "paid", itemCount: 1, createdAt: daysAgo(0) },
  { id: "o2", userName: "Liam Walsh", total: 49.99, currency: "USD", status: "paid", itemCount: 1, createdAt: daysAgo(1) },
  { id: "o3", userName: "Daniel Park", total: 189.98, currency: "USD", status: "paid", itemCount: 2, createdAt: daysAgo(2) },
  { id: "o4", userName: "Zainab Ali", total: 69.99, currency: "USD", status: "refunded", itemCount: 1, createdAt: daysAgo(3) },
  { id: "o5", userName: "Kwame Osei", total: 49.99, currency: "USD", status: "pending", itemCount: 1, createdAt: daysAgo(4) },
];

export const demoTickets: AdminTicketRow[] = [
  { id: "t1", userName: "Kwame Osei", subject: "Can't access course after purchase", status: "open", createdAt: daysAgo(0) },
  { id: "t2", userName: "Sofia Rossi", subject: "Certificate name is misspelled", status: "pending", createdAt: daysAgo(1) },
  { id: "t3", userName: "Daniel Park", subject: "Refund request for duplicate charge", status: "open", createdAt: daysAgo(2) },
  { id: "t4", userName: "Amara Nwosu", subject: "Video won't play on mobile", status: "resolved", createdAt: daysAgo(5) },
];

export const demoAudit: AdminAuditRow[] = [
  { id: "a1", actorName: "Site Admin", action: "course.published", entity: "Calculus Made Intuitive", at: daysAgo(0) },
  { id: "a2", actorName: "Dr. Ada Mensah", action: "course.created", entity: "SAT Math Mastery", at: daysAgo(1) },
  { id: "a3", actorName: "Site Admin", action: "coupon.created", entity: "WELCOME20", at: daysAgo(2) },
  { id: "a4", actorName: "Site Admin", action: "user.role_changed", entity: "marcus@example.com → instructor", at: daysAgo(3) },
  { id: "a5", actorName: "Site Admin", action: "category.created", entity: "Test Prep", at: daysAgo(4) },
];

export const demoSettings: SiteSettings = {
  siteName: "DMATHS Learning Hub",
  primaryColor: "#2563EB",
  accentColor: "#14B8A6",
  features: { affiliates: true, gamification: true, blog: true },
  seoTitle: "DMATHS Learning Hub — Master real skills",
  seoDescription:
    "A modern learning platform to master mathematics, coding, and in-demand skills.",
};
