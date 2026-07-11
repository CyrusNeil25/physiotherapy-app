import { site } from "@/lib/site";

/**
 * Builds a standard UPI deep link (upi://pay?...) — recognised by every UPI
 * app (GPay, PhonePe, Paytm, BHIM) both as a scannable QR payload and as a
 * tap-to-pay link on mobile. Pre-fills payee, amount and a note so the
 * patient never has to type the doctor's UPI ID by hand.
 */
export function buildUpiLink(amountInr: number, note: string) {
  const params = new URLSearchParams({
    pa: site.upiId,
    pn: site.doctor.name,
    am: amountInr.toFixed(2),
    cu: "INR",
    tn: note.slice(0, 50),
  });
  return `upi://pay?${params.toString()}`;
}
