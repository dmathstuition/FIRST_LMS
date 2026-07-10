import type {
  CheckoutSession,
  CreateCheckoutParams,
  PaymentProvider,
  WebhookResult,
} from "./provider";

/**
 * Development mock payment provider.
 *
 * Produces a fake checkout session that points back to the success URL so the
 * post-purchase flow (enrollment, receipts) can be built and tested before any
 * real provider keys exist. NEVER used when a real provider is configured.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock" as const;

  async createCheckout(
    params: CreateCheckoutParams,
  ): Promise<CheckoutSession> {
    const reference = `mock_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    // In the mock, we short-circuit to the success URL with the reference so the
    // caller can simulate a completed purchase in development.
    const url = `${params.successUrl}${
      params.successUrl.includes("?") ? "&" : "?"
    }mock_reference=${reference}`;
    return { provider: "mock", reference, url };
  }

  async verifyWebhook(payload: string): Promise<WebhookResult> {
    try {
      const parsed = JSON.parse(payload) as Partial<WebhookResult>;
      return {
        type: parsed.type ?? "payment.succeeded",
        reference: parsed.reference ?? "mock_reference",
        amount: parsed.amount,
        currency: parsed.currency,
        metadata: parsed.metadata,
      };
    } catch {
      return { type: "ignored", reference: "unknown" };
    }
  }
}
