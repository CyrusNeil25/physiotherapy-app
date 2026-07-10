"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { getCheckoutParams, confirmRazorpayPayment } from "@/app/consult/actions";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";

/** Resumes an unfinished Razorpay payment from the consultation page. */
export function PayNowButton({
  consultationId,
  serviceName,
}: {
  consultationId: string;
  serviceName: string;
}) {
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");

  async function pay() {
    setStatus("working");
    const params = await getCheckoutParams(consultationId);
    if (!params.ok) {
      setStatus("error");
      return;
    }
    try {
      await openRazorpayCheckout({
        keyId: params.razorpayKeyId,
        orderId: params.orderId,
        amountInr: params.amountInr,
        title: site.name,
        description: serviceName,
        onSuccess: async (response) => {
          const confirmed = await confirmRazorpayPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          if (confirmed.ok) window.location.reload();
          else setStatus("error");
        },
        onDismiss: () => setStatus("idle"),
      });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <button
        onClick={pay}
        disabled={status === "working"}
        className="rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {status === "working" ? "Opening…" : "Complete payment"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">
          Could not open the payment. Please try again or contact us.
        </p>
      )}
    </div>
  );
}
