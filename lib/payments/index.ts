import crypto from "crypto";
import type { PaymentProvider } from "./types";
import { razorpayProvider } from "./razorpay";

/**
 * Manual mode: no gateway. The patient pays by UPI/cash directly and the
 * doctor confirms receipt from the admin inbox ("Mark as paid"). Lets the
 * whole consultation flow run before a Razorpay account exists, and stays
 * available as a fallback.
 */
const manualProvider: PaymentProvider = {
  name: "manual",
  async createOrder() {
    return { orderId: `manual_${crypto.randomUUID()}` };
  },
  async refund() {
    // Nothing to call — the doctor returns the money directly.
  },
};

export function razorpayConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
}

/** Razorpay when keys are present, manual otherwise. */
export function getPaymentProvider(): PaymentProvider {
  return razorpayConfigured() ? razorpayProvider : manualProvider;
}
