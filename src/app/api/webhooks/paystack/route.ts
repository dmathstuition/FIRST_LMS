import { NextResponse, type NextRequest } from "next/server";

import {
  getPaymentProvider,
  hasLivePayments,
  PaystackProvider,
} from "@/lib/payments";
import { recordPurchaseAndEnroll } from "@/features/checkout/service";

// Node runtime: the webhook signature check uses node:crypto.
export const runtime = "nodejs";

/**
 * Paystack webhook. Paystack POSTs signed events here (charge.success, refunds).
 * The signature is verified inside the provider before we act. This is the
 * source of truth for enrollment — the return-callback is best-effort UX, the
 * webhook guarantees the learner is enrolled even if they close the tab.
 */
export async function POST(req: NextRequest) {
  if (!hasLivePayments()) {
    // No live provider configured — nothing to verify against.
    return NextResponse.json({ ok: true, skipped: true });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const provider = getPaymentProvider("paystack") as PaystackProvider;
  const result = await provider.verifyWebhook(raw, signature);

  if (result.type === "payment.succeeded") {
    const md = result.metadata ?? {};
    const userId = md.userId;
    const courseId = (md.courseIds ?? "").split(",").filter(Boolean)[0];
    if (userId && courseId) {
      await recordPurchaseAndEnroll({
        userId,
        courseId,
        nairaAmount: (result.amount ?? 0) / 100, // kobo → Naira
        reference: result.reference,
      });
    }
  }

  // Always 200 for authenticated-and-handled or ignored events so Paystack
  // doesn't retry indefinitely; unauthenticated payloads are treated as ignored.
  return NextResponse.json({ ok: true });
}
