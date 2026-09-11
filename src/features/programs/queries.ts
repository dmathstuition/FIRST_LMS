import "server-only";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";

/**
 * Program (cohort) queries. Published programs are public; drafts and the
 * registration list are admin-only (RLS). Everything returns empty/null when
 * Supabase isn't configured so the pages render clean empty states.
 */

export type Program = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverUrl: string | null;
  format: string;
  location: string | null;
  price: number;
  currency: string;
  discountPrice: number | null;
  capacity: number | null;
  startDate: string | null;
  endDate: string | null;
  enrollmentDeadline: string | null;
  status: "draft" | "published";
  isFeatured: boolean;
};

type ProgramRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_url: string | null;
  format: string;
  location: string | null;
  price: number;
  currency: string;
  discount_price: number | null;
  capacity: number | null;
  start_date: string | null;
  end_date: string | null;
  enrollment_deadline: string | null;
  status: "draft" | "published";
  is_featured: boolean;
};

const PROGRAM_SELECT = `
  id, slug, title, subtitle, description, cover_url, format, location,
  price, currency, discount_price, capacity, start_date, end_date,
  enrollment_deadline, status, is_featured
`;

function mapProgram(row: ProgramRow): Program {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    coverUrl: row.cover_url,
    format: row.format,
    location: row.location,
    price: Number(row.price),
    currency: row.currency,
    discountPrice: row.discount_price != null ? Number(row.discount_price) : null,
    capacity: row.capacity,
    startDate: row.start_date,
    endDate: row.end_date,
    enrollmentDeadline: row.enrollment_deadline,
    status: row.status,
    isFeatured: row.is_featured,
  };
}

/** Published programs for the public /programs page, soonest start first. */
export async function getPublishedPrograms(): Promise<Program[]> {
  if (!integrations.supabase) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("programs")
      .select(PROGRAM_SELECT)
      .eq("status", "published")
      .order("start_date", { ascending: true, nullsFirst: false });
    if (error || !data) return [];
    return (data as unknown as ProgramRow[]).map(mapProgram);
  } catch {
    return [];
  }
}

/** A single published program by slug for /programs/[slug]. */
export async function getProgramBySlug(slug: string): Promise<Program | null> {
  if (!integrations.supabase) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("programs")
      .select(PROGRAM_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    return mapProgram(data as unknown as ProgramRow);
  } catch {
    return null;
  }
}

export async function getPublishedProgramSlugs(): Promise<string[]> {
  if (!integrations.supabase) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("programs")
      .select("slug")
      .eq("status", "published");
    if (error || !data) return [];
    return (data as { slug: string }[]).map((r) => r.slug);
  } catch {
    return [];
  }
}

/* ------------------------------- admin views ------------------------------ */

/** All programs (any status) for the admin list, newest first. */
export async function getAdminPrograms(): Promise<Program[]> {
  if (!integrations.supabase) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("programs")
      .select(PROGRAM_SELECT)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as ProgramRow[]).map(mapProgram);
  } catch {
    return [];
  }
}

export async function getAdminProgramById(id: string): Promise<Program | null> {
  if (!integrations.supabase) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("programs")
      .select(PROGRAM_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return mapProgram(data as unknown as ProgramRow);
  } catch {
    return null;
  }
}

export type ProgramRegistration = {
  id: string;
  name: string;
  email: string;
  note: string | null;
  createdAt: string;
};

/** Registrations for a program (admin only), newest first. */
export async function getProgramRegistrations(
  programId: string,
): Promise<ProgramRegistration[]> {
  if (!integrations.supabase) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("program_registrations")
      .select("id, name, email, note, created_at")
      .eq("program_id", programId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (
      data as { id: string; name: string; email: string; note: string | null; created_at: string }[]
    ).map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      note: r.note,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}
