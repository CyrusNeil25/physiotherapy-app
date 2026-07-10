import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { activatePaidConsultation } from "@/lib/consultations";

/**
 * Razorpay webhook — the production source of truth for payment state.
 * Configure in the Razorpay dashboard: <site-url>/api/webhooks/razorpay,
 * event "payment.captured", with RAZORPAY_WEBHOOK_SECRET as the secret.
 * Idempotent: replays and overlap with the checkout callback are no-ops.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    event: string;
    payload?: { payment?: { entity?: { id: string; order_id: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "payment.captured") {
    const entity = event.payload?.payment?.entity;
    if (entity?.order_id) {
      await activatePaidConsultation({
        providerOrderId: entity.order_id,
        providerPaymentId: entity.id,
        raw: event,
      });
    }
  }

  // Always 200 for verified events we don't handle, so Razorpay stops retrying
  return NextResponse.json({ ok: true });
}
