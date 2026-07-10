/**
 * Payment provider abstraction.
 *
 * A single `PaymentProvider` interface is implemented by Stripe, Paystack, and
 * Flutterwave adapters (added in Phase 9). Until real keys are configured, a
 * dev mock is returned so checkout flows can be exercised end-to-end locally.
 *
 * Selection is driven by env (see `src/lib/env.ts::integrations`).
 */

export type Currency = "USD" | "NGN" | "GHS" | "KES" | "ZAR" | "EUR" | "GBP";

export interface CheckoutLineItem {
  courseId: string;
  title: string;
  /** Unit amount in the smallest currency unit (e.g. cents). */
  unitAmount: number;
  quantity: number;
}

export interface CreateCheckoutParams {
  userId: string;
  email: string;
  currency: Currency;
  items: CheckoutLineItem[];
  couponCode?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  /** Provider name that produced the session. */
  provider: PaymentProviderName;
  /** Opaque provider session/reference id. */
  reference: string;
  /** URL to redirect the customer to in order to complete payment. */
  url: string;
}

export interface WebhookResult {
  type: "payment.succeeded" | "payment.failed" | "refund.succeeded" | "ignored";
  reference: string;
  amount?: number;
  currency?: Currency;
  metadata?: Record<string, string>;
}

export type PaymentProviderName = "stripe" | "paystack" | "flutterwave" | "mock";

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  /** Create a hosted checkout session and return a redirect URL. */
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutSession>;
  /** Parse + verify an incoming webhook payload. */
  verifyWebhook(payload: string, signature: string | null): Promise<WebhookResult>;
}
