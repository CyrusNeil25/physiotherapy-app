import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";

/** How long a consultation thread stays open after payment confirms. */
export const CONSULT_WINDOW_DAYS = 7;

export function doctorNotifyEmail() {
  return process.env.CONTACT_TO_EMAIL ?? site.contactEmail;
}

/**
 * Marks a payment as paid and opens its consultation. The single activation
 * path shared by the Razorpay checkout callback, the Razorpay webhook, and
 * the admin's manual "mark as paid" — idempotent, keyed on the payment row,
 * and run with the service-role client (payment state is never patient-writable).
 */
export async function activatePaidConsultation(opts: {
  paymentId?: string;
  providerOrderId?: string;
  providerPaymentId?: string | null;
  raw?: unknown;
}): Promise<{ ok: boolean; consultationId?: string; alreadyPaid?: boolean }> {
  const supabase = createAdminClient();

  const query = supabase.from("payments").select("*");
  const { data: payment } = await (opts.paymentId
    ? query.eq("id", opts.paymentId)
    : query.eq("provider_order_id", opts.providerOrderId!)
  ).maybeSingle();

  if (!payment || !payment.consultation_id) return { ok: false };
  if (payment.status === "paid") {
    return { ok: true, consultationId: payment.consultation_id, alreadyPaid: true };
  }

  const { error: payErr } = await supabase
    .from("payments")
    .update({
      status: "paid",
      provider_payment_id: opts.providerPaymentId ?? payment.provider_payment_id,
      raw: (opts.raw as never) ?? payment.raw,
    })
    .eq("id", payment.id)
    .eq("status", "created"); // idempotency guard
  if (payErr) {
    console.error("[activatePaidConsultation] payment update", payErr);
    return { ok: false };
  }

  const openedAt = new Date();
  const expiresAt = new Date(openedAt.getTime() + CONSULT_WINDOW_DAYS * 86_400_000);
  const { error: consErr } = await supabase
    .from("consultations")
    .update({
      status: "active",
      opened_at: openedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", payment.consultation_id)
    .eq("status", "awaiting_payment");
  if (consErr) {
    console.error("[activatePaidConsultation] consultation update", consErr);
    return { ok: false };
  }

  await sendEmail({
    to: doctorNotifyEmail(),
    subject: "New paid consultation — Restore Physiotherapy",
    text: `A new online consultation has been paid for and is waiting for your reply.\n\nOpen it here: ${site.url}/consultation/${payment.consultation_id}`,
  });

  return { ok: true, consultationId: payment.consultation_id };
}
