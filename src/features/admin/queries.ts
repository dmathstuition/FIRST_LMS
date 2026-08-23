import "server-only";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";
import type { UserRole } from "@/types";
import type { StudentRow } from "@/features/instructor/types";
import { demoStudents } from "@/features/instructor/demo-data";
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
import {
  demoAdminCategories,
  demoAdminCourses,
  demoAdminStats,
  demoAudit,
  demoCoupons,
  demoOrders,
  demoRevenueSeries,
  demoSettings,
  demoSignupSeries,
  demoTickets,
  demoUsers,
} from "./demo-data";

/**
 * Admin panel data access. Demo data when Supabase isn't configured; otherwise
 * platform-wide reads (admins bypass row restrictions via the is_admin() RLS
 * policies), degrading to empty/zero states on error.
 */

export async function getAdminStats(): Promise<AdminStats> {
  if (!integrations.supabase) return demoAdminStats;
  try {
    const supabase = await createClient();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [students, instructors, courses, published, tickets, paidOrders, newUsers] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "instructor"),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("orders").select("total").eq("status", "paid"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
      ]);

    const paid = (paidOrders.data as { total: number }[] | null) ?? [];
    const totalRevenue = paid.reduce((sum, o) => sum + Number(o.total), 0);

    return {
      totalRevenue,
      totalSales: paid.length,
      totalStudents: students.count ?? 0,
      totalInstructors: instructors.count ?? 0,
      totalCourses: courses.count ?? 0,
      publishedCourses: published.count ?? 0,
      newUsersThisMonth: newUsers.count ?? 0,
      openTickets: tickets.count ?? 0,
    };
  } catch {
    return {
      totalRevenue: 0,
      totalSales: 0,
      totalStudents: 0,
      totalInstructors: 0,
      totalCourses: 0,
      publishedCourses: 0,
      newUsersThisMonth: 0,
      openTickets: 0,
    };
  }
}

export async function getRevenueSeries(): Promise<SeriesPoint[]> {
  if (!integrations.supabase) return demoRevenueSeries;
  try {
    const supabase = await createClient();
    // Last 6 months of paid revenue, bucketed by month.
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("orders")
      .select("total, created_at")
      .eq("status", "paid")
      .gte("created_at", since.toISOString());

    const rows = (data as { total: number; created_at: string }[] | null) ?? [];

    // Seed the 6 month buckets in order so empty months still render.
    const buckets: { label: string; key: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      buckets.push({
        label: d.toLocaleString("en-US", { month: "short" }),
        key: `${d.getFullYear()}-${d.getMonth()}`,
        value: 0,
      });
    }
    for (const r of rows) {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.value += Number(r.total);
    }
    return buckets.map(({ label, value }) => ({ label, value }));
  } catch {
    return [];
  }
}

export async function getSignupSeries(): Promise<SeriesPoint[]> {
  if (!integrations.supabase) return demoSignupSeries;
  return [];
}

export async function getUsers(): Promise<AdminUserRow[]> {
  if (!integrations.supabase) return demoUsers;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, xp_points, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error || !data) return [];
    return (data as unknown as UserJoinRow[]).map((u) => ({
      id: u.id,
      name: u.full_name ?? "User",
      email: "", // email lives in auth.users; surfaced via an admin function later
      role: u.role,
      avatarUrl: u.avatar_url,
      joinedAt: u.created_at,
      xp: u.xp_points ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getAdminCourses(): Promise<AdminCourseRow[]> {
  if (!integrations.supabase) return demoAdminCourses;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select(
        `id, title, slug, status, student_count, price, is_featured, created_at,
         instructor:instructor_id ( full_name ),
         category:category_id ( name )`,
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error || !data) return [];
    return (data as unknown as AdminCourseJoinRow[]).map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      instructorName: c.instructor?.full_name ?? "—",
      categoryName: c.category?.name ?? null,
      status: c.status,
      studentCount: c.student_count,
      price: Number(c.price),
      isFeatured: c.is_featured,
      createdAt: c.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getAdminCategories(): Promise<AdminCategoryRow[]> {
  if (!integrations.supabase) return demoAdminCategories;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("sort_order", { ascending: true });
    if (error || !data) return [];
    return (data as { id: string; name: string; slug: string }[]).map((c) => ({
      ...c,
      courseCount: 0,
    }));
  } catch {
    return [];
  }
}

export async function getCoupons(): Promise<AdminCouponRow[]> {
  if (!integrations.supabase) return demoCoupons;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("coupons")
      .select(
        "id, code, discount_type, amount, redemptions, max_redemptions, expires_at, active",
      )
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as CouponRow[]).map((c) => ({
      id: c.id,
      code: c.code,
      discountType: c.discount_type,
      amount: Number(c.amount),
      redemptions: c.redemptions,
      maxRedemptions: c.max_redemptions,
      expiresAt: c.expires_at,
      active: c.active,
    }));
  } catch {
    return [];
  }
}

export async function getOrders(): Promise<AdminOrderRow[]> {
  if (!integrations.supabase) return demoOrders;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("id, total, currency, status, created_at, buyer:user_id ( full_name )")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error || !data) return [];
    return (data as unknown as OrderRow[]).map((o) => ({
      id: o.id,
      userName: o.buyer?.full_name ?? "—",
      total: Number(o.total),
      currency: o.currency,
      status: o.status,
      itemCount: 1,
      createdAt: o.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getTickets(): Promise<AdminTicketRow[]> {
  if (!integrations.supabase) return demoTickets;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("support_tickets")
      .select("id, subject, status, created_at, author:user_id ( full_name )")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error || !data) return [];
    return (data as unknown as TicketRow[]).map((t) => ({
      id: t.id,
      userName: t.author?.full_name ?? "—",
      subject: t.subject,
      status: t.status,
      createdAt: t.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getAuditLogs(): Promise<AdminAuditRow[]> {
  if (!integrations.supabase) return demoAudit;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("id, action, entity, created_at, actor:actor_id ( full_name )")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error || !data) return [];
    return (data as unknown as AuditRow[]).map((a) => ({
      id: a.id,
      actorName: a.actor?.full_name ?? "System",
      action: a.action,
      entity: a.entity,
      at: a.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!integrations.supabase) return demoSettings;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["branding", "features", "seo"]);
    const map = new Map(
      ((data as { key: string; value: Record<string, unknown> }[]) ?? []).map(
        (r) => [r.key, r.value],
      ),
    );
    const branding = (map.get("branding") ?? {}) as Record<string, string>;
    const features = (map.get("features") ?? {}) as Record<string, boolean>;
    const seo = (map.get("seo") ?? {}) as Record<string, string>;
    return {
      siteName: branding.name ?? demoSettings.siteName,
      primaryColor: branding.primary ?? demoSettings.primaryColor,
      accentColor: branding.accent ?? demoSettings.accentColor,
      features: {
        affiliates: features.affiliates ?? true,
        gamification: features.gamification ?? true,
        blog: features.blog ?? true,
      },
      seoTitle: seo.title ?? demoSettings.seoTitle,
      seoDescription: seo.description ?? demoSettings.seoDescription,
    };
  } catch {
    return demoSettings;
  }
}

/** Platform-wide student enrollments + progress (admin monitoring). */
export async function getStudentProgress(): Promise<StudentRow[]> {
  if (!integrations.supabase) return demoStudents;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `progress_pct, created_at,
         student:user_id ( full_name, avatar_url ),
         course:course_id ( title )`,
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error || !data) return [];
    return (data as unknown as EnrollmentJoinRow[]).map((row, i) => ({
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

/* -------------------------------- helpers --------------------------------- */

type EnrollmentJoinRow = {
  progress_pct: number | null;
  created_at: string;
  student: { full_name: string | null; avatar_url: string | null } | null;
  course: { title: string } | null;
};

type UserJoinRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  xp_points: number | null;
  created_at: string;
};
type AdminCourseJoinRow = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  student_count: number;
  price: number;
  is_featured: boolean;
  created_at: string;
  instructor: { full_name: string | null } | null;
  category: { name: string } | null;
};
type CouponRow = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  amount: number;
  redemptions: number;
  max_redemptions: number | null;
  expires_at: string | null;
  active: boolean;
};
type OrderRow = {
  id: string;
  total: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
  buyer: { full_name: string | null } | null;
};
type TicketRow = {
  id: string;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  created_at: string;
  author: { full_name: string | null } | null;
};
type AuditRow = {
  id: string;
  action: string;
  entity: string | null;
  created_at: string;
  actor: { full_name: string | null } | null;
};
