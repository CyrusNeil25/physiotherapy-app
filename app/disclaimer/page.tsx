import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description: "Medical disclaimer for information and online consultations.",
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Medical disclaimer">
      <p>
        The information on this website — including articles, exercise
        suggestions and answers to common questions — is provided for general
        education. It is not a diagnosis and is not a substitute for an
        in-person assessment by a qualified healthcare professional.
      </p>

      <h2>Online consultations</h2>
      <p>
        Online chat consultations with {site.doctor.name} provide professional
        guidance based on the information you share. Because a physical
        examination is not possible online, this guidance has limits:
      </p>
      <ul>
        <li>
          It is suitable for advice, exercise guidance, second opinions and
          deciding whether an in-person visit is needed.
        </li>
        <li>
          It is <strong>not suitable for emergencies</strong>. If you have
          severe pain, numbness or weakness in your limbs, loss of bladder or
          bowel control, chest pain, or symptoms after a serious accident,
          seek emergency medical care immediately.
        </li>
        <li>
          If your problem needs a physical examination, imaging or a
          physician&apos;s attention, you will be told so honestly.
        </li>
      </ul>

      <h2>Your responsibility</h2>
      <p>
        Always share complete and accurate information about your condition,
        and stop any exercise that causes sharp or worsening pain. Following
        guidance received online is at your own discretion; when in doubt,
        book an in-person assessment.
      </p>
    </LegalPage>
  );
}
