import crypto from "node:crypto";

import type {
  CheckoutSession,
  CreateCheckoutParams,
  PaymentProvider,
  WebhookResult,
} from "./provider";

const PAYSTACK_API = "https://api.paystack.co";

/**
 * Paystack payment adapter (live).
 *
 * Flow:
 *  1. `createCheckout` calls Transaction Initialize and returns Paystack's
 *     hosted `authorization_url` to redirect the customer to.
 *  2. On return, the callback route calls `verifyTransaction(reference)`.
 *  3. Independently, Paystack POSTs a signed webhook which `verifyWebhook`
 *     authenticates (HMAC-SHA512 of the raw body with the secret key).
 *
 * Amounts are in the smallest currency unit (kobo for NGN) — callers must pass
 * `unitAmount` already in kobo. This adapter only runs server-side; the secret
 * key never reaches the client.
 */
export class PaystackProvider implements PaymentProvider {
  readonly name = "paystack" as const;

  constructor(private readonly secretKey: string) {}

  private authHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };
  }

  async createCheckout(
    params: CreateCheckoutParams,
  ): Promise<CheckoutSession> {
    const amount = params.items.reduce(
      (sum, item) => sum + item.unitAmount * item.quantity,
      0,
    );

    const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
      method: "POST",
      headers: this.authHeaders(),
      cache: "no-store",
      body: JSON.stringify({
        email: params.email,
        amount, // kobo
        currency: params.currency,
        callback_url: params.successUrl,
        metadata: {
          userId: params.userId,
          cancelUrl: params.cancelUrl,
          courseIds: params.items.map((i) => i.courseId).join(","),
          ...(params.metadata ?? {}),
        },
      }),
    });

    const json = (await res.json()) as {
      status: boolean;
      message?: string;
      data?: { authorization_url: string; reference: string };
    };

    if (!json.status || !json.data) {
      throw new Error(json.message || "Paystack initialization failed");
    }

    return {
      provider: "paystack",
      reference: json.data.reference,
      url: json.data.authorization_url,
    };
  }

  /** Verify a transaction by reference (used by the return/callback route). */
  async verifyTransaction(reference: string): Promise<WebhookResult> {
    const res = await fetch(
      `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: this.authHeaders(), cache: "no-store" },
    );
    const json = (await res.json()) as {
      status: boolean;
      data?: {
        status: string;
        reference: string;
        amount: number;
        currency: string;
        metadata?: Record<string, string>;
      };
    };

    if (!json.status || !json.data) {
      return { type: "ignored", reference };
    }
    const d = json.data;
    return {
      type: d.status === "success" ? "payment.succeeded" : "payment.failed",
      reference: d.reference,
      amount: d.amount,
      currency: d.currency as WebhookResult["currency"],
      metadata: d.metadata ?? {},
    };
  }

  async verifyWebhook(
    payload: string,
    signature: string | null,
  ): Promise<WebhookResult> {
    // Authenticate the webhook: HMAC-SHA512 of the raw body with the secret key
    // must equal the x-paystack-signature header. Timing-safe compare.
    const expected = crypto
      .createHmac("sha512", this.secretKey)
      .update(payload)
      .digest("hex");

    const provided = signature ?? "";
    const valid =
      provided.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));

    if (!valid) return { type: "ignored", reference: "unauthenticated" };

    let evt: {
      event?: string;
      data?: {
        reference?: string;
        transaction_reference?: string;
        amount?: number;
        currency?: string;
        metadata?: Record<string, string>;
      };
    };
    try {
      evt = JSON.parse(payload);
    } catch {
      return { type: "ignored", reference: "unparseable" };
    }

    const d = evt.data ?? {};
    if (evt.event === "charge.success") {
      return {
        type: "payment.succeeded",
        reference: d.reference ?? "unknown",
        amount: d.amount,
        currency: d.currency as WebhookResult["currency"],
        metadata: d.metadata ?? {},
      };
    }
    if (evt.event?.startsWith("refund")) {
      return {
        type: "refund.succeeded",
        reference: d.reference ?? d.transaction_reference ?? "unknown",
        amount: d.amount,
        currency: d.currency as WebhookResult["currency"],
      };
    }
    return { type: "ignored", reference: d.reference ?? "unknown" };
  }
}
