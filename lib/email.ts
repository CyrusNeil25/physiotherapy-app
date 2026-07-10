/**
 * Sends via Resend when RESEND_API_KEY is set; otherwise logs to the server
 * console so every email-triggering flow is fully testable without
 * credentials (dev mode). Never put patient health details in an email body
 * — link out to the site instead.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      `[email] RESEND_API_KEY not set — would send to ${opts.to}\nSubject: ${opts.subject}\n\n${opts.text}`
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Website <onboarding@resend.dev>",
      to: [opts.to],
      reply_to: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
    }),
  });

  if (!res.ok) {
    console.error("[email] Resend error", res.status, await res.text());
  }
}
