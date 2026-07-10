import { integrations } from "@/lib/env";
import { MockPaymentProvider } from "./mock";
import type { PaymentProvider, PaymentProviderName } from "./provider";

/**
 * Resolve the active payment provider.
 *
 * Real Stripe/Paystack/Flutterwave adapters are wired in Phase 9. Until their
 * env keys are present, we fall back to the mock so the checkout UX is testable.
 */
export function getPaymentProvider(
  preferred?: PaymentProviderName,
): PaymentProvider {
  // Phase 9 will branch here on `preferred` + `integrations.*` and return the
  // matching real adapter. For the foundation build every path uses the mock.
  if (preferred === "stripe" && integrations.stripe) {
    // return new StripeProvider();  // added in Phase 9
  }
  return new MockPaymentProvider();
}

export * from "./provider";
