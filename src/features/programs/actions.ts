"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { integrations } from "@/lib/env";
import { slugify } from "@/lib/utils";
import { clientIdentifier, rateLimit } from "@/lib/rate-limit";

export type ProgramActionState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

const optionalDate = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : null));

const programSchema = z.object({
  title: z.string().min(3, "Give the program a title").max(160),
  slug: z.string().max(160).optional().or(z.literal("")),
  subtitle: z.string().max(200).optional().or(z.literal("")),
  description: z.string().max(20_000).optional().or(z.literal("")),
  coverUrl: z.string().url("Cover must be a valid URL").optional().or(z.literal("")),
  format: z.string().max(60).optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  price: z.coerce.number().min(0).max(10_000_000),
  discountPrice: z.coerce.number().min(0).max(10_000_000).optional(),
  capacity: z.coerce.number().int().min(0).max(100000).optional(),
  startDate: optionalDate,
  endDate: optionalDate,
  enrollmentDeadline: optionalDate,
  published: z.coerce.boolean().optional(),
});

function buildPayload(data: z.infer<typeof programSchema>) {
  return {
    title: data.title,
    slug: slugify(data.slug || data.title),
    subtitle: data.subtitle || null,
    description: data.description || null,
    cover_url: data.coverUrl || null,
    format: data.format || "Online live",
    location: data.location || null,
    price: data.price,
    discount_price: data.discountPrice ? data.discountPrice : null,
    capacity: data.capacity ? data.capacity : null,
    start_date: data.startDate,
    end_date: data.endDate,
    enrollment_deadline: data.enrollmentDeadline,
    status: data.published ? "published" : "draft",
  };
}

function parse(formData: FormData) {
  return programSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    subtitle: formData.get("subtitle"),
    description: formData.get("description"),
    coverUrl: formData.get("coverUrl"),
    format: formData.get("format"),
    location: formData.get("location"),
    price: formData.get("price") || 0,
    discountPrice: formData.get("discountPrice") || undefined,
    capacity: formData.get("capacity") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    enrollmentDeadline: formData.get("enrollmentDeadline"),
    published: formData.get("published") === "on",
  });
}

/** Create a program (admin). Redirects to the admin list on success. */
export async function createProgram(
  _prev: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!integrations.supabase) {
    return { ok: true, message: "Program saved. (Connect Supabase to persist.)" };
  }
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return { ok: false, message: "Not authorized." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("programs").insert(buildPayload(parsed.data));
    if (error) {
      if (error.code === "23505") {
        return { ok: false, message: "A program with that slug already exists." };
      }
      return { ok: false, message: error.message };
    }
  } catch {
    return { ok: false, message: "Could not create the program." };
  }

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
  redirect("/admin/programs");
}

/** Update a program (admin). */
export async function updateProgram(
  programId: string,
  _prev: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!integrations.supabase) {
    return { ok: true, message: "Changes saved. (Connect Supabase to persist.)" };
  }
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return { ok: false, message: "Not authorized." };

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("programs")
      .update(buildPayload(parsed.data))
      .eq("id", programId);
    if (error) {
      if (error.code === "23505") {
        return { ok: false, message: "A program with that slug already exists." };
      }
      return { ok: false, message: error.message };
    }
  } catch {
    return { ok: false, message: "Could not save the program." };
  }

  revalidatePath("/admin/programs");
  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath("/programs");
  revalidatePath(`/programs/${buildPayload(parsed.data).slug}`);
  return { ok: true, message: "Program saved." };
}

export async function toggleProgramPublished(programId: string, publish: boolean) {
  if (!integrations.supabase) return;
  const supabase = await createClient();
  await supabase
    .from("programs")
    .update({ status: publish ? "published" : "draft" })
    .eq("id", programId);
  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}

export async function deleteProgram(programId: string) {
  if (!integrations.supabase) return;
  const supabase = await createClient();
  await supabase.from("programs").delete().eq("id", programId);
  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}

/* ------------------------------ registration ------------------------------ */

const registrationSchema = z.object({
  name: z.string().min(2, "Enter your name").max(120),
  email: z.string().email("Enter a valid email").max(200),
  note: z.string().max(1000).optional().or(z.literal("")),
});

/** Public "reserve a spot" registration. Rate-limited; idempotent per email. */
export async function registerForProgram(
  programId: string,
  programSlug: string,
  _prev: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const id = await clientIdentifier();
  const limited = rateLimit("program-register", id, { limit: 5, windowMs: 60_000 });
  if (!limited.success) {
    return { ok: false, message: "Too many attempts. Please try again shortly." };
  }

  if (!integrations.supabase) {
    return { ok: true, message: "Spot reserved! (Connect Supabase to persist.)" };
  }

  const user = await getSessionUser();

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("program_registrations").insert({
      program_id: programId,
      user_id: user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      note: parsed.data.note || null,
    });
    if (error && error.code === "23505") {
      return { ok: true, message: "You're already registered — we'll be in touch!" };
    }
    if (error) {
      return { ok: false, message: "Could not register right now. Try again later." };
    }
  } catch {
    return { ok: false, message: "Could not register right now. Try again later." };
  }

  revalidatePath(`/programs/${programSlug}`);
  return { ok: true, message: "Spot reserved! We'll email you the details soon." };
}
