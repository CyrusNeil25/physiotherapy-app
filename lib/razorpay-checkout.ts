"use client";

/** Loads Razorpay's checkout script once and opens the payment modal. */

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(opts: {
  keyId: string;
  orderId: string;
  amountInr: number;
  title: string;
  description: string;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss: () => void;
}) {
  await loadScript();
  const rzp = new window.Razorpay!({
    key: opts.keyId,
    order_id: opts.orderId,
    amount: opts.amountInr * 100,
    currency: "INR",
    name: opts.title,
    description: opts.description,
    handler: opts.onSuccess,
    modal: { ondismiss: opts.onDismiss },
    theme: { color: "#0f766e" },
  });
  rzp.open();
}
