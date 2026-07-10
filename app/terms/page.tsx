import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for this website and its services.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>
        By using this website and its services you agree to these terms.
        Please also read the{" "}
        <Link href="/disclaimer" className="text-teal-700">
          medical disclaimer
        </Link>
        ,{" "}
        <Link href="/privacy-policy" className="text-teal-700">
          privacy policy
        </Link>{" "}
        and{" "}
        <Link href="/refund-policy" className="text-teal-700">
          refund policy
        </Link>
        .
      </p>

      <h2>Services</h2>
      <ul>
        <li>
          {site.name} provides physiotherapy services at the clinic, at
          patients&apos; homes, and professional guidance through online
          consultations by {site.doctor.name} ({site.doctor.credentials},{" "}
          {site.doctor.registrationNumber}).
        </li>
        <li>
          Online consultations are a professional opinion based on the
          information you provide — accuracy of that information is your
          responsibility.
        </li>
        <li>
          Prices shown on the website are current but may change; the price
          shown at the time of payment is what applies.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <ul>
        <li>
          Consultation threads are for the paying patient&apos;s own health
          concern (or that of a dependent in their care).
        </li>
        <li>
          Abusive behaviour or misuse of the platform may lead to a
          consultation being closed without refund.
        </li>
      </ul>

      <h2>Liability</h2>
      <p>
        We take professional care in all guidance provided. To the extent
        permitted by law, liability for use of information on this website or
        guidance provided online is limited to the amount paid for the
        relevant consultation.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${site.contactEmail}`} className="text-teal-700">
          {site.contactEmail}
        </a>
        .
      </p>
    </LegalPage>
  );
}
