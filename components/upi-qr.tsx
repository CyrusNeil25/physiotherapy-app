import QRCode from "qrcode";
import { buildUpiLink } from "@/lib/upi";
import { site, formatInr } from "@/lib/site";

/** Server component — the QR is generated at render time, no client JS needed. */
export async function UpiQr({ amountInr, note }: { amountInr: number; note: string }) {
  const link = buildUpiLink(amountInr, note);
  const dataUrl = await QRCode.toDataURL(link, { margin: 1, width: 240 });

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-amber-200 bg-white p-5">
      <p className="text-sm font-semibold text-stone-700">
        Scan to pay {formatInr(amountInr)}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element -- data: URI, not an optimizable asset */}
      <img
        src={dataUrl}
        alt="Scan with any UPI app to pay"
        width={240}
        height={240}
        className="rounded-lg"
      />
      <a
        href={link}
        className="w-full rounded-full bg-teal-700 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-teal-800"
      >
        Or tap to pay in a UPI app
      </a>
      <p className="text-xs text-stone-400">{site.upiId}</p>
    </div>
  );
}
