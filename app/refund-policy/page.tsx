import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Refunds and cancellations for consultations and appointments.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & cancellation policy">
      <h2>Online chat consultations</h2>
      <ul>
        <li>
          If your consultation has not been answered within the promised
          window ({site.replyPromise.toLowerCase()}), you may request a full
          refund.
        </li>
        <li>
          If you paid but did not receive access to a consultation thread due
          to a technical problem, you get a full refund.
        </li>
        <li>
          Once {site.doctor.shortName} has replied with her assessment, the
          consultation is considered delivered and is not refundable.
        </li>
      </ul>

      <h2>Clinic and home-visit appointments</h2>
      <ul>
        <li>
          Cancel or reschedule at least 4 hours before your slot at no charge.
        </li>
        <li>
          Prepaid appointments cancelled with less notice, or missed without
          informing us, may not be refunded — the slot was held for you.
        </li>
      </ul>

      <h2>How refunds are processed</h2>
      <p>
        Approved refunds are returned to your original payment method within
        5–7 working days. To request a refund, write to{" "}
        <a href={`mailto:${site.contactEmail}`} className="text-teal-700">
          {site.contactEmail}
        </a>{" "}
        or message us on WhatsApp with your payment reference.
      </p>
    </LegalPage>
  );
}
