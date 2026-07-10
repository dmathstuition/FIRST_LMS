"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";
import { slugify } from "@/lib/utils";
import type { UserRole } from "@/types";

/**
 * Admin management Server Actions. All writes are gated by the is_admin() RLS
 * policies, so a non-admin session cannot mutate through these even if invoked.
 * They no-op with a friendly message when Supabase isn't configured.
 */

export type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

/* ------------------------------- categories ------------------------------- */

const categorySchema = z.object({
  name: z.string().min(2, "Enter a category name").max(60),
  description: z.string().max(200).optional().or(z.literal("")),
});

export async function createCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!integrations.supabase) {
    return { ok: true, message: "Category added. (Connect Supabase to persist.)" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("categories").insert({
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
      description: parsed.data.description || null,
    });
    if (error) return { ok: false, message: error.message };
    revalidatePath("/admin/categories");
    return { ok: true, message: `Category “${parsed.data.name}” created.` };
  } catch {
    return { ok: false, message: "Could not create category." };
  }
}

export async function deleteCategory(categoryId: string) {
  if (!integrations.supabase) return;
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/admin/categories");
}

/* --------------------------------- coupons -------------------------------- */

const couponSchema = z.object({
  code: z.string().min(3, "Enter a code").max(40).toUpperCase(),
  discountType: z.enum(["percent", "fixed"]),
  amount: z.coerce.number().min(1).max(100000),
  maxRedemptions: z.coerce.number().int().min(0).optional(),
});

export async function createCoupon(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    discountType: formData.get("discountType"),
    amount: formData.get("amount"),
    maxRedemptions: formData.get("maxRedemptions") || 0,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (parsed.data.discountType === "percent" && parsed.data.amount > 100) {
    return { ok: false, message: "Percentage discount can't exceed 100%." };
  }
  if (!integrations.supabase) {
    return { ok: true, message: "Coupon created. (Connect Supabase to persist.)" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("coupons").insert({
      code: parsed.data.code,
      discount_type: parsed.data.discountType,
      amount: parsed.data.amount,
      max_redemptions: parsed.data.maxRedemptions || null,
    });
    if (error) return { ok: false, message: error.message };
    revalidatePath("/admin/coupons");
    return { ok: true, message: `Coupon ${parsed.data.code} created.` };
  } catch {
    return { ok: false, message: "Could not create coupon." };
  }
}

/* --------------------------------- courses -------------------------------- */

export async function setCourseFeatured(courseId: string, featured: boolean) {
  if (!integrations.supabase) return;
  const supabase = await createClient();
  await supabase
    .from("courses")
    .update({ is_featured: featured })
    .eq("id", courseId);
  revalidatePath("/admin/courses");
}

/* ---------------------------------- users --------------------------------- */

export async function setUserRole(userId: string, role: UserRole) {
  if (!integrations.supabase) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/users");
}

/* -------------------------------- settings -------------------------------- */

const settingsSchema = z.object({
  siteName: z.string().min(2).max(80),
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(300).optional().or(z.literal("")),
  affiliates: z.coerce.boolean().optional(),
  gamification: z.coerce.boolean().optional(),
  blog: z.coerce.boolean().optional(),
});

export async function updateSiteSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = settingsSchema.safeParse({
    siteName: formData.get("siteName"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    affiliates: formData.get("affiliates") === "on",
    gamification: formData.get("gamification") === "on",
    blog: formData.get("blog") === "on",
  });
  if (!parsed.success) {
    return { ok: false, message: "Please check your inputs." };
  }
  if (!integrations.supabase) {
    return { ok: true, message: "Settings saved. (Connect Supabase to persist.)" };
  }
  try {
    const supabase = await createClient();
    await supabase.from("site_settings").upsert([
      {
        key: "branding",
        value: { name: parsed.data.siteName },
      },
      {
        key: "features",
        value: {
          affiliates: !!parsed.data.affiliates,
          gamification: !!parsed.data.gamification,
          blog: !!parsed.data.blog,
        },
      },
      {
        key: "seo",
        value: {
          title: parsed.data.seoTitle || "",
          description: parsed.data.seoDescription || "",
        },
      },
    ]);
    revalidatePath("/admin/settings");
    return { ok: true, message: "Site settings updated." };
  } catch {
    return { ok: false, message: "Could not save settings." };
  }
}
