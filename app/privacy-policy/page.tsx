import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we collect, use and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        {site.name} respects your privacy. This page explains what
        information we collect and how it is used and protected.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Contact details</strong> — name, phone number and email when
          you submit the contact form or book an appointment.
        </li>
        <li>
          <strong>Health information</strong> — details you share about your
          condition during consultations, including any photos or reports you
          choose to upload. This is collected only to provide you care.
        </li>
        <li>
          <strong>Payment information</strong> — payments are processed by a
          secure payment provider; we never see or store your card or UPI
          credentials.
        </li>
      </ul>

      <h2>How your information is used</h2>
      <ul>
        <li>To respond to your enquiries and provide consultations.</li>
        <li>To send appointment confirmations and consultation updates.</li>
        <li>Never sold or shared with third parties for marketing.</li>
      </ul>

      <h2>How health information is protected</h2>
      <ul>
        <li>
          Consultation conversations and uploaded files are private between
          you and {site.doctor.name}, stored securely, and accessible only
          through your account.
        </li>
        <li>
          Emails and notifications never contain your medical details — only
          a link to view them after signing in.
        </li>
      </ul>

      <h2>Your choices</h2>
      <p>
        You may request a copy of your information or ask for your account
        and records to be deleted by writing to{" "}
        <a href={`mailto:${site.contactEmail}`} className="text-teal-700">
          {site.contactEmail}
        </a>
        . Clinical records may be retained where required by law or
        professional guidelines.
      </p>
    </LegalPage>
  );
}
