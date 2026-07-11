import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { site, formatInr, whatsappLink } from "@/lib/site";
import { MessageComposer } from "@/components/message-composer";
import { MessageList } from "@/components/message-list";
import { ConsultAdminActions } from "@/components/consult-admin-actions";
import { PayNowButton } from "@/components/pay-now-button";
import { RatingForm } from "@/components/rating-form";
import { UpiQr } from "@/components/upi-qr";
import { MarkThreadRead } from "@/components/mark-thread-read";
import type { Intake } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Consultation" };

const statusLabels: Record<string, { label: string; cls: string }> = {
  awaiting_payment: { label: "Awaiting payment", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  active: { label: "Waiting for doctor", cls: "bg-teal-50 text-teal-700 border-teal-200" },
  answered: { label: "Doctor replied", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed: { label: "Closed", cls: "bg-stone-100 text-stone-600 border-stone-200" },
  refunded: { label: "Refunded", cls: "bg-red-50 text-red-600 border-red-200" },
};

function fmt(ts: string) {
  return new Date(ts).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // RLS scopes this: patients get their own, the doctor gets everything
  const { data: consultation } = await supabase
    .from("consultations")
    .select("*, services(name, price_inr), profiles(full_name)")
    .eq("id", id)
    .maybeSingle();
  if (!consultation) notFound();

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isDoctor = viewerProfile?.role === "admin";

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("consultation_id", id)
    .order("created_at");

  const { data: payment } = await supabase
    .from("payments")
    .select("provider, status, amount_inr")
    .eq("consultation_id", id)
    .maybeSingle();

  const service = Array.isArray(consultation.services)
    ? consultation.services[0]
    : consultation.services;
  const patient = Array.isArray(consultation.profiles)
    ? consultation.profiles[0]
    : consultation.profiles;
  const intake = consultation.intake as Intake;
  const status = statusLabels[consultation.status];
  const expired =
    consultation.expires_at && new Date(consultation.expires_at) < new Date();
  const canPost =
    ["active", "answered"].includes(consultation.status) && !expired;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <MarkThreadRead consultationId={id} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            {service?.name}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {isDoctor
              ? `Patient: ${patient?.full_name || "Unnamed"} · `
              : `With ${site.doctor.name} · `}
            Started {fmt(consultation.created_at)}
            {consultation.expires_at &&
              ` · Open until ${fmt(consultation.expires_at)}`}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${status?.cls ?? ""}`}
        >
          {status?.label ?? consultation.status}
        </span>
      </div>

      {consultation.scheduled_at && (
        <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-800">
          📅 Scheduled chat: {fmt(consultation.scheduled_at)}
        </p>
      )}

      {/* Payment banner */}
      {consultation.status === "awaiting_payment" && !isDoctor && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-800">
            Payment pending — {service ? formatInr(service.price_inr) : ""}
          </p>
          {payment?.provider === "razorpay" ? (
            <div className="mt-3">
              <p className="mb-3 text-sm text-amber-700">
                Complete the payment to open your consultation.
              </p>
              <PayNowButton consultationId={id} serviceName={service?.name ?? ""} />
            </div>
          ) : (
            <div className="mt-3">
              <UpiQr
                amountInr={service?.price_inr ?? 0}
                note={`Consult ${id.slice(0, 8)}`}
              />
              <p className="mt-3 text-sm leading-relaxed text-amber-700">
                After paying, share the screenshot{" "}
                <a
                  href={whatsappLink(
                    `Hi, I've paid for my online consultation (ref ${id.slice(0, 8)}). Sharing the screenshot.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  on WhatsApp
                </a>
                . {site.doctor.shortName} will confirm and your consultation
                will open — you&apos;ll get an email.
              </p>
            </div>
          )}
        </div>
      )}

      {isDoctor && (
        <div className="mt-6">
          <ConsultAdminActions consultationId={id} status={consultation.status} />
        </div>
      )}

      {/* Intake, pinned */}
      <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Problem description
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
          {intake.problem}
        </p>
        <dl className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-3">
          {intake.pain_area && (
            <div>
              <dt className="text-stone-500">Pain area</dt>
              <dd className="font-medium text-stone-800">{intake.pain_area}</dd>
            </div>
          )}
          {intake.duration && (
            <div>
              <dt className="text-stone-500">Since</dt>
              <dd className="font-medium text-stone-800">{intake.duration}</dd>
            </div>
          )}
          {intake.history && (
            <div className="sm:col-span-3">
              <dt className="text-stone-500">History</dt>
              <dd className="font-medium text-stone-800">{intake.history}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Messages — live via Supabase Realtime */}
      <div className="mt-6">
        <MessageList
          consultationId={id}
          initialMessages={messages ?? []}
          viewerId={user.id}
          patientId={consultation.patient_id}
          patientName={patient?.full_name || "Patient"}
          doctorName={site.doctor.shortName}
          isDoctor={isDoctor}
          emptyText={
            consultation.status === "awaiting_payment"
              ? null
              : isDoctor
                ? "No messages yet — reply below to answer this consultation."
                : `No messages yet. You can add photos, reports or more detail below — ${site.doctor.shortName} will reply soon.`
          }
        />
      </div>

      {/* Composer / closed notice */}
      <div className="mt-6">
        {canPost ? (
          <MessageComposer consultationId={id} />
        ) : consultation.status !== "awaiting_payment" ? (
          <p className="rounded-xl bg-stone-100 p-4 text-center text-sm text-stone-600">
            {expired && ["active", "answered"].includes(consultation.status)
              ? "This consultation window has ended."
              : "This consultation is closed."}{" "}
            {!isDoctor && (
              <a href="/consult" className="font-semibold text-teal-700">
                Start a follow-up →
              </a>
            )}
          </p>
        ) : null}
      </div>

      {/* Rating — patient only, once the consultation is closed */}
      {!isDoctor && consultation.status === "closed" && (
        <div className="mt-6">
          {consultation.rating === null ? (
            <RatingForm consultationId={id} />
          ) : (
            <p className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center text-sm text-stone-600">
              You rated this consultation{" "}
              <span className="text-amber-500">
                {"★".repeat(consultation.rating)}
              </span>{" "}
              — thank you!
            </p>
          )}
        </div>
      )}

      {isDoctor && consultation.rating !== null && (
        <p className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          Patient rating:{" "}
          <span className="text-amber-500">{"★".repeat(consultation.rating)}</span>
          {consultation.rating_comment && <> · “{consultation.rating_comment}”</>}
        </p>
      )}

      {!isDoctor && (
        <p className="mt-6 text-center text-xs text-stone-400">
          Not for emergencies. If your symptoms are severe or worsening
          rapidly, seek immediate medical care.
        </p>
      )}
    </div>
  );
}
