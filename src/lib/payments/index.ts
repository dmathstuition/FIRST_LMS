import { integrations } from "@/lib/env";
import { MockPaymentProvider } from "./mock";
import { PaystackProvider } from "./paystack";
import type { PaymentProvider, PaymentProviderName } from "./provider";

/**
 * Resolve the active payment provider.
 *
 * Paystack is the primary live provider (NGN). When its secret key isn't set,
 * we fall back to the mock so the checkout UX stays testable end-to-end without
 * real keys. Stripe/Flutterwave slot in here the same way when added.
 */
export function getPaymentProvider(
  preferred?: PaymentProviderName,
): PaymentProvider {
  const wantsPaystack = preferred === "paystack" || preferred === undefined;
  if (wantsPaystack && integrations.paystack && process.env.PAYSTACK_SECRET_KEY) {
    return new PaystackProvider(process.env.PAYSTACK_SECRET_KEY);
  }
  if (preferred === "stripe" && integrations.stripe) {
    // return new StripeProvider();  // slots in the same way
  }
  return new MockPaymentProvider();
}

/** True when a real payment provider (not the mock) is configured. */
export function hasLivePayments(): boolean {
  return Boolean(integrations.paystack && process.env.PAYSTACK_SECRET_KEY);
}

export { PaystackProvider };
export * from "./provider";
