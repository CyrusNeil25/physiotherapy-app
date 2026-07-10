"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

type Result = { ok: true } | { ok: false; error: string };

/** Postgres exclusion-constraint violation code — the real double-booking guard. */
const EXCLUSION_VIOLATION = "23P01";

export async function createBooking(input: {
  serviceId: string;
  serviceName: string;
  startsAt: string;
  endsAt: string;
  mode: "clinic" | "home_visit";
  patientNote?: string;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Please sign in first." };

  const { error } = await supabase.from("bookings").insert({
    patient_id: user.id,
    service_id: input.serviceId,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    mode: input.mode,
    patient_note: input.patientNote || null,
  });

  if (error) {
    if (error.code === EXCLUSION_VIOLATION) {
      return { ok: false, error: "That slot was just taken — please pick another." };
    }
    console.error("[createBooking]", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: "Booking received — Restore Physiotherapy",
      text: `Your appointment request for "${input.serviceName}" on ${new Date(
        input.startsAt
      ).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      })} has been received and is pending confirmation. You'll get another email once it's confirmed.`,
    });
  }

  return { ok: true };
}
