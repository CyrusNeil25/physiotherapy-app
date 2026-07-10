"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatInr, site } from "@/lib/site";
import { startConsultation, confirmRazorpayPayment } from "@/app/consult/actions";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";

type ChatService = { id: string; name: string; price_inr: number };

export function ConsultForm({ services }: { services: ChatService[] }) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [problem, setProblem] = useState("");
  const [painArea, setPainArea] = useState("");
  const [duration, setDuration] = useState("");
  const [history, setHistory] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState("");

  const service = services.find((s) => s.id === serviceId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!service) return;
    setStatus("working");
    setError("");

    const result = await startConsultation({
      serviceId,
      intake: { problem, pain_area: painArea, duration, history },
    });

    if (!result.ok) {
      setError(result.error);
      setStatus("error");
      return;
    }

    if (result.provider === "manual" || !result.razorpayKeyId) {
      // No gateway configured — thread page shows payment instructions
      router.push(`/consultation/${result.consultationId}`);
      return;
    }

    try {
      await openRazorpayCheckout({
        keyId: result.razorpayKeyId,
        orderId: result.orderId,
        amountInr: result.amountInr,
        title: site.name,
        description: service.name,
        onSuccess: async (response) => {
          const confirmed = await confirmRazorpayPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          if (confirmed.ok) {
            window.location.href = `/consultation/${result.consultationId}`;
          } else {
            setError(
              "Payment received but confirmation failed — please refresh in a minute or contact us."
            );
            setStatus("error");
          }
        },
        onDismiss: () => {
          // Order stays open; the thread page offers a "complete payment" button
          window.location.href = `/consultation/${result.consultationId}`;
        },
      });
    } catch {
      setError("Could not open the payment window. Please try again.");
      setStatus("error");
    }
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Consultation type
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setServiceId(s.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                s.id === serviceId
                  ? "border-teal-600 bg-teal-50"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <p className="font-semibold text-stone-900">{s.name}</p>
              <p className="mt-1 text-sm text-stone-600">{formatInr(s.price_inr)}</p>
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">
          Describe your problem
        </span>
        <textarea
          required
          rows={4}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          className={inputCls}
          placeholder="What's bothering you? Where does it hurt, and what makes it better or worse?"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">
            Pain area <span className="font-normal text-stone-400">(optional)</span>
          </span>
          <input
            value={painArea}
            onChange={(e) => setPainArea(e.target.value)}
            className={inputCls}
            placeholder="E.g. lower back, right knee"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">
            Since when? <span className="font-normal text-stone-400">(optional)</span>
          </span>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={inputCls}
            placeholder="E.g. 3 weeks"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">
          Relevant history{" "}
          <span className="font-normal text-stone-400">
            (optional — surgeries, conditions, medications)
          </span>
        </span>
        <textarea
          rows={2}
          value={history}
          onChange={(e) => setHistory(e.target.value)}
          className={inputCls}
        />
      </label>

      <p className="rounded-lg bg-stone-50 px-4 py-3 text-xs leading-relaxed text-stone-500">
        You&apos;ll be able to attach photos and reports in the private chat
        after payment. {site.replyPromise}.
      </p>

      <label className="flex items-start gap-3 text-sm text-stone-600">
        <input
          required
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-teal-700"
        />
        <span>
          I understand this is professional guidance, not an emergency service,
          and that it doesn&apos;t replace a physical examination where one is
          needed. I agree to the{" "}
          <a href="/disclaimer" target="_blank" className="text-teal-700 underline">
            medical disclaimer
          </a>
          .
        </span>
      </label>

      {status === "error" && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "working" || !service}
        className="w-full rounded-full bg-teal-700 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {status === "working"
          ? "Starting…"
          : service
            ? `Continue to payment · ${formatInr(service.price_inr)}`
            : "Continue"}
      </button>
    </form>
  );
}
