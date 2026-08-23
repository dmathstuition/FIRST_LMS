import "server-only";

import { integrations } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export interface CouponResult {
  /** Final price after any discount (never below 0). */
  price: number;
  /** True when a valid coupon was applied. */
  applied: boolean;
  /** Normalized code that was applied (uppercase), if any. */
  code?: string;
}

// Demo coupons — used when Supabase isn't connected so the flow is demonstrable.
const DEMO_COUPONS: Record<
  string,
  { type: "percent" | "fixed"; amount: number }
> = {
  DMATHS10: { type: "percent", amount: 10 },
  WELCOME: { type: "fixed", amount: 1000 },
};

function discountedPrice(
  price: number,
  type: "percent" | "fixed",
  amount: number,
): number {
  const off = type === "percent" ? price * (amount / 100) : amount;
  return Math.max(0, Math.round(price - off));
}

/**
 * Validate a coupon code and return the resulting price. Invalid, expired, or
 * exhausted coupons are ignored (price unchanged, applied:false) rather than
 * erroring — the user still checks out at full price.
 */
export async function applyCoupon(
  rawCode: string | null | undefined,
  price: number,
): Promise<CouponResult> {
  const code = (rawCode ?? "").trim().toUpperCase();
  if (!code) return { price, applied: false };

  if (!integrations.supabase) {
    const demo = DEMO_COUPONS[code];
    if (!demo) return { price, applied: false };
    return {
      price: discountedPrice(price, demo.type, demo.amount),
      applied: true,
      code,
    };
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("coupons")
      .select("discount_type, amount, max_redemptions, redemptions, expires_at, active")
      .eq("code", code)
      .maybeSingle();

    const coupon = data as {
      discount_type: "percent" | "fixed";
      amount: number;
      max_redemptions: number | null;
      redemptions: number;
      expires_at: string | null;
      active: boolean;
    } | null;

    if (!coupon || !coupon.active) return { price, applied: false };
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { price, applied: false };
    }
    if (
      coupon.max_redemptions != null &&
      coupon.redemptions >= coupon.max_redemptions
    ) {
      return { price, applied: false };
    }

    return {
      price: discountedPrice(price, coupon.discount_type, Number(coupon.amount)),
      applied: true,
      code,
    };
  } catch {
    return { price, applied: false };
  }
}
