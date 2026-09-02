import "server-only";

import { integrations } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Persist a successful purchase and enroll the learner — best-effort.
 *
 * Runs only when Supabase is configured (in demo mode there is nothing to write
 * to, and access is simulated). Idempotent on the payment reference so a webhook
 * and a return-callback firing for the same transaction don't double-insert.
 * Any failure is logged, never thrown, so it can't break the caller's redirect.
 */
export async function recordPurchaseAndEnroll(opts: {
  userId: string;
  courseId: string;
  courseTitle?: string;
  nairaAmount: number;
  reference: string;
}): Promise<{ created: boolean }> {
  // Demo mode: nothing to persist. Report "created" so the mock flow still
  // triggers the receipt email (which itself no-ops without Resend configured).
  if (!integrations.supabase) return { created: true };

  try {
    const supabase = await createClient();

    // Idempotency guard: this reference already recorded?
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("reference", opts.reference)
      .maybeSingle();

    if (existing) {
      // Ensure enrollment even on a repeat call, but don't re-email.
      await supabase.from("enrollments").upsert(
        { user_id: opts.userId, course_id: opts.courseId, status: "active" },
        { onConflict: "user_id,course_id", ignoreDuplicates: true },
      );
      return { created: false };
    }

    {
      const { data: order } = await supabase
        .from("orders")
        .insert({
          user_id: opts.userId,
          status: "paid",
          currency: "NGN",
          subtotal: opts.nairaAmount,
          total: opts.nairaAmount,
        })
        .select("id")
        .single();

      const orderId = (order as { id: string } | null)?.id;
      if (orderId) {
        await supabase.from("payments").insert({
          order_id: orderId,
          provider: "paystack",
          reference: opts.reference,
          amount: opts.nairaAmount,
          currency: "NGN",
          status: "paid",
        });
        // Line item so the receipt can show which course was bought.
        await supabase.from("order_items").insert({
          order_id: orderId,
          course_id: opts.courseId,
          title: opts.courseTitle ?? "Course",
          unit_price: opts.nairaAmount,
          quantity: 1,
        });
      }
    }

    // Enroll (idempotent on the unique (user_id, course_id) constraint).
    await supabase.from("enrollments").upsert(
      { user_id: opts.userId, course_id: opts.courseId, status: "active" },
      { onConflict: "user_id,course_id", ignoreDuplicates: true },
    );
    return { created: true };
  } catch (error) {
    console.error("recordPurchaseAndEnroll failed:", error);
    return { created: false };
  }
}
