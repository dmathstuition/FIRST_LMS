import type { SeriesPoint } from "@/features/instructor/types";
import type { UserRole } from "@/types";

export type { SeriesPoint };

export interface AdminStats {
  totalRevenue: number;
  totalSales: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  publishedCourses: number;
  newUsersThisMonth: number;
  openTickets: number;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  joinedAt: string;
  xp: number;
}

export interface AdminCourseRow {
  id: string;
  title: string;
  slug: string;
  instructorName: string;
  categoryName: string | null;
  status: "draft" | "published" | "archived";
  studentCount: number;
  price: number;
  isFeatured: boolean;
  createdAt: string;
}

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  courseCount: number;
}

export interface AdminCouponRow {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  amount: number;
  redemptions: number;
  maxRedemptions: number | null;
  expiresAt: string | null;
  active: boolean;
}

export interface AdminOrderRow {
  id: string;
  userName: string;
  total: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  itemCount: number;
  createdAt: string;
}

export interface AdminTicketRow {
  id: string;
  userName: string;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  createdAt: string;
}

export interface AdminAuditRow {
  id: string;
  actorName: string;
  action: string;
  entity: string | null;
  at: string;
}

export interface SiteSettings {
  siteName: string;
  primaryColor: string;
  accentColor: string;
  features: {
    affiliates: boolean;
    gamification: boolean;
    blog: boolean;
  };
  seoTitle: string;
  seoDescription: string;
}
