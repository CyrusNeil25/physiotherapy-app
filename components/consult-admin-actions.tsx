"use client";

import { useState, useTransition } from "react";
import {
  markConsultationPaid,
  closeConsultation,
  refundConsultation,
} from "@/app/consultation/actions";

export function ConsultAdminActions({
  consultationId,
  status,
}: {
  consultationId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, confirmText: string) {
    if (!window.confirm(confirmText)) return;
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  }

  const open = status === "active" || status === "answered";

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        Doctor actions
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {status === "awaiting_payment" && (
          <button
            disabled={isPending}
            onClick={() =>
              run(
                () => markConsultationPaid(consultationId),
                "Confirm you have received this payment? The consultation will open."
              )
            }
            className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            Mark as paid
          </button>
        )}
        {open && (
          <button
            disabled={isPending}
            onClick={() =>
              run(
                () => closeConsultation(consultationId),
                "Close this consultation? The patient won't be able to send more messages."
              )
            }
            className="rounded-full bg-stone-700 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
          >
            Close consultation
          </button>
        )}
        {status !== "refunded" && status !== "awaiting_payment" && (
          <button
            disabled={isPending}
            onClick={() =>
              run(
                () => refundConsultation(consultationId),
                "Refund this consultation? This can't be undone."
              )
            }
            className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Refund
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
