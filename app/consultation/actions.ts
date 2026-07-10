"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { activatePaidConsultation, doctorNotifyEmail } from "@/lib/consultations";
import { getPaymentProvider } from "@/lib/payments";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";
import type { Attachment } from "@/lib/supabase/types";

type Result = { ok: true } | { ok: false; error: string };

export async function sendMessage(input: {
  consultationId: string;
  body: string;
  attachments: Attachment[];
}): Promise<Result> {
  const body = input.body.trim().slice(0, 5000);
  if (!body && input.attachments.length === 0) {
    return { ok: false, error: "Write a message or attach a file." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  // RLS: patients only ever see their own consultation here
  const { data: consultation } = await supabase
    .from("consultations")
    .select("id, patient_id, status, expires_at")
    .eq("id", input.consultationId)
    .maybeSingle();
  if (!consultation) return { ok: false, error: "Consultation not found." };

  if (!["active", "answered"].includes(consultation.status)) {
    return { ok: false, error: "This consultation isn't open for messages." };
  }
  if (consultation.expires_at && new Date(consultation.expires_at) < new Date()) {
    return { ok: false, error: "This consultation window has ended." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isDoctor = profile?.role === "admin";

  const { error: msgErr } = await supabase.from("messages").insert({
    consultation_id: consultation.id,
    sender_id: user.id,
    body,
    attachments: input.attachments.slice(0, 5) as never,
  });
  if (msgErr) {
    console.error("[sendMessage]", msgErr);
    return { ok: false, error: "Could not send. Please try again." };
  }

  // Status flip + notification run with the service role — patients have no
  // update policy on consultations by design.
  const admin = createAdminClient();
  await admin
    .from("consultations")
    .update({ status: isDoctor ? "answered" : "active" })
    .eq("id", consultation.id)
    .in("status", ["active", "answered"]);

  const threadUrl = `${site.url}/consultation/${consultation.id}`;
  if (isDoctor) {
    const { data: patientUser } = await admin.auth.admin.getUserById(
      consultation.patient_id
    );
    if (patientUser.user?.email) {
      await sendEmail({
        to: patientUser.user.email,
        subject: `${site.doctor.shortName} has replied — ${site.name}`,
        text: `You have a new reply in your online consultation.\n\nView it here: ${threadUrl}`,
      });
    }
  } else {
    await sendEmail({
      to: doctorNotifyEmail(),
      subject: `Patient message — ${site.name}`,
      text: `A patient has sent a new message in a consultation.\n\nOpen it here: ${threadUrl}`,
    });
  }

  revalidatePath(`/consultation/${consultation.id}`);
  return { ok: true };
}

/**
 * Marks every message from the other party as read. Called on thread open
 * and when a message arrives while the thread is on screen — the sender's
 * read ticks update via the Realtime UPDATE feed.
 */
export async function markThreadRead(consultationId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  // RLS-scoped: resolves only if the viewer is the patient or the doctor
  const { data: consultation } = await supabase
    .from("consultations")
    .select("id")
    .eq("id", consultationId)
    .maybeSingle();
  if (!consultation) return { ok: false, error: "Not found." };

  const admin = createAdminClient();
  await admin
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("consultation_id", consultationId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  return { ok: true };
}

/** Patient rates a closed consultation (1–5 stars + optional comment). */
export async function rateConsultation(input: {
  consultationId: string;
  rating: number;
  comment: string;
}): Promise<Result> {
  const rating = Math.round(input.rating);
  if (rating < 1 || rating > 5) return { ok: false, error: "Pick 1 to 5 stars." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const { data: consultation } = await supabase
    .from("consultations")
    .select("id, patient_id, status, rating")
    .eq("id", input.consultationId)
    .maybeSingle();
  if (!consultation || consultation.patient_id !== user.id) {
    return { ok: false, error: "Not found." };
  }
  if (consultation.status !== "closed") {
    return { ok: false, error: "You can rate once the consultation is closed." };
  }
  if (consultation.rating !== null) {
    return { ok: false, error: "Already rated — thank you!" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("consultations")
    .update({
      rating,
      rating_comment: input.comment.trim().slice(0, 1000) || null,
    })
    .eq("id", input.consultationId)
    .is("rating", null);
  if (error) return { ok: false, error: "Could not save your rating." };

  revalidatePath(`/consultation/${input.consultationId}`);
  return { ok: true };
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? supabase : null;
}

/** Manual-payment mode: the doctor confirms she received the money. */
export async function markConsultationPaid(consultationId: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized." };

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("id")
    .eq("consultation_id", consultationId)
    .eq("status", "created")
    .maybeSingle();
  if (!payment) return { ok: false, error: "No pending payment found." };

  const result = await activatePaidConsultation({ paymentId: payment.id });
  if (!result.ok) return { ok: false, error: "Could not activate." };

  revalidatePath(`/consultation/${consultationId}`);
  revalidatePath("/admin/inbox");
  return { ok: true };
}

export async function closeConsultation(consultationId: string): Promise<Result> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Not authorized." };

  const { error } = await supabase
    .from("consultations")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", consultationId);
  if (error) return { ok: false, error: "Could not close." };

  revalidatePath(`/consultation/${consultationId}`);
  revalidatePath("/admin/inbox");
  return { ok: true };
}

export async function refundConsultation(consultationId: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized." };

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("id, provider, provider_payment_id, amount_inr, status")
    .eq("consultation_id", consultationId)
    .eq("status", "paid")
    .maybeSingle();
  if (!payment) return { ok: false, error: "No paid payment to refund." };

  if (payment.provider === "razorpay" && payment.provider_payment_id) {
    try {
      await getPaymentProvider().refund(payment.provider_payment_id, payment.amount_inr);
    } catch (e) {
      console.error("[refundConsultation]", e);
      return { ok: false, error: "Gateway refund failed — try from the Razorpay dashboard." };
    }
  }

  await admin.from("payments").update({ status: "refunded" }).eq("id", payment.id);
  await admin
    .from("consultations")
    .update({ status: "refunded", closed_at: new Date().toISOString() })
    .eq("id", consultationId);

  revalidatePath(`/consultation/${consultationId}`);
  revalidatePath("/admin/inbox");
  return { ok: true };
}
