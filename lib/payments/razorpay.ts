import crypto from "crypto";
import type { PaymentProvider } from "./types";

/**
 * Razorpay via plain REST — no SDK dependency. Server-only (uses the key
 * secret). Amounts cross the API boundary in paise.
 */

function authHeader() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay keys not configured");
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

export const razorpayProvider: PaymentProvider = {
  name: "razorpay",

  async createOrder(amountInr, receipt) {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountInr * 100, // paise
        currency: "INR",
        receipt,
      }),
    });
    if (!res.ok) {
      throw new Error(`Razorpay order creation failed: ${res.status} ${await res.text()}`);
    }
    const order = (await res.json()) as { id: string };
    return { orderId: order.id };
  },

  async refund(providerPaymentId, amountInr) {
    const res = await fetch(
      `https://api.razorpay.com/v1/payments/${providerPaymentId}/refund`,
      {
        method: "POST",
        headers: { Authorization: authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInr * 100 }),
      }
    );
    if (!res.ok) {
      throw new Error(`Razorpay refund failed: ${res.status} ${await res.text()}`);
    }
  },
};

/**
 * Verifies the signature Razorpay Checkout returns to the browser after a
 * successful payment: HMAC-SHA256(order_id + "|" + payment_id, key_secret).
 * Cryptographically proves the payment happened — safe to trust server-side.
 */
export function verifyCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return (
    expected.length === params.signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.signature))
  );
}

/** Verifies a Razorpay webhook: HMAC-SHA256 of the raw body with the webhook secret. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return (
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}
