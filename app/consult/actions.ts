"use server";

import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payments";
import { verifyCheckoutSignature } from "@/lib/payments/razorpay";
import { activatePaidConsultation } from "@/lib/consultations";
import type { Intake } from "@/lib/supabase/types";

type StartResult =
  | {
      ok: true;
      consultationId: string;
      provider: "razorpay" | "manual";
      orderId: string;
      amountInr: number;
      razorpayKeyId?: string;
    }
  | { ok: false; error: string };

export async function startConsultation(input: {
  serviceId: string;
  intake: Intake;
  scheduledAt?: string;
}): Promise<StartResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  if (!input.intake.problem?.trim()) {
    return { ok: false, error: "Please describe your problem." };
  }

  let scheduledAt: string | null = null;
  if (input.scheduledAt) {
    const parsed = new Date(input.scheduledAt);
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() < Date.now()) {
      return { ok: false, error: "Please pick a valid, upcoming time." };
    }
    scheduledAt = parsed.toISOString();
  }

  const { data: service } = await supabase
    .from("services")
    .select("id, name, mode, price_inr, active")
    .eq("id", input.serviceId)
    .single();
  if (!service || service.mode !== "chat" || !service.active) {
    return { ok: false, error: "This service is not available." };
  }

  const { data: consultation, error: consErr } = await supabase
    .from("consultations")
    .insert({
      patient_id: user.id,
      service_id: service.id,
      scheduled_at: scheduledAt,
      intake: {
        problem: input.intake.problem.trim().slice(0, 5000),
        pain_area: (input.intake.pain_area ?? "").trim().slice(0, 200),
        duration: (input.intake.duration ?? "").trim().slice(0, 200),
        history: (input.intake.history ?? "").trim().slice(0, 5000),
      },
    })
    .select("id")
    .single();
  if (consErr || !consultation) {
    console.error("[startConsultation]", consErr);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const provider = getPaymentProvider();
  let orderId: string;
  try {
    ({ orderId } = await provider.createOrder(
      service.price_inr,
      `consult_${consultation.id.slice(0, 8)}`
    ));
  } catch (e) {
    console.error("[startConsultation] createOrder", e);
    return { ok: false, error: "Could not start the payment. Please try again." };
  }

  const { error: payErr } = await supabase.from("payments").insert({
    patient_id: user.id,
    consultation_id: consultation.id,
    provider: provider.name,
    provider_order_id: orderId,
    amount_inr: service.price_inr,
  });
  if (payErr) {
    console.error("[startConsultation] payment insert", payErr);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  return {
    ok: true,
    consultationId: consultation.id,
    provider: provider.name,
    orderId,
    amountInr: service.price_inr,
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  };
}

/**
 * Called from the browser after Razorpay Checkout succeeds. The signature is
 * HMAC'd with our key secret, so verifying it server-side proves the payment
 * — the webhook then re-confirms idempotently in production.
 */
export async function confirmRazorpayPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<{ ok: boolean }> {
  if (
    !verifyCheckoutSignature({
      orderId: input.orderId,
      paymentId: input.paymentId,
      signature: input.signature,
    })
  ) {
    console.error("[confirmRazorpayPayment] bad signature for order", input.orderId);
    return { ok: false };
  }

  const result = await activatePaidConsultation({
    providerOrderId: input.orderId,
    providerPaymentId: input.paymentId,
  });
  return { ok: result.ok };
}

/** Lets a patient resume an unfinished Razorpay payment from the thread page. */
export async function getCheckoutParams(consultationId: string): Promise<
  | { ok: true; orderId: string; amountInr: number; razorpayKeyId: string }
  | { ok: false }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  // RLS limits this to the patient's own payments
  const { data: payment } = await supabase
    .from("payments")
    .select("provider, provider_order_id, amount_inr, status")
    .eq("consultation_id", consultationId)
    .eq("status", "created")
    .maybeSingle();

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!payment || payment.provider !== "razorpay" || !payment.provider_order_id || !keyId) {
    return { ok: false };
  }
  return {
    ok: true,
    orderId: payment.provider_order_id,
    amountInr: payment.amount_inr,
    razorpayKeyId: keyId,
  };
}
