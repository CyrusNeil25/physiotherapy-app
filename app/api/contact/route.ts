import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { sendEmail } from "@/lib/email";

/**
 * Contact-form handler.
 * Sends via Resend when RESEND_API_KEY is set; otherwise logs to the server
 * console (dev mode) so the form is fully testable without credentials.
 * NOTE: per the privacy rules of this project, the form asks users NOT to
 * include sensitive medical details — this email is plain contact mail.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const honeypot = String(body.company ?? "").trim();

  // Bots fill the hidden field; pretend success so they move on
  if (honeypot) return NextResponse.json({ ok: true });

  if (!name || !phone || !message) {
    return NextResponse.json(
      { error: "Name, phone and message are required" },
      { status: 400 }
    );
  }
  if (name.length > 200 || phone.length > 50 || message.length > 5000) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const text = [
    `New contact form message from ${site.name} website`,
    ``,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "—"}`,
    ``,
    message,
  ].join("\n");

  await sendEmail({
    to: process.env.CONTACT_TO_EMAIL ?? site.contactEmail,
    subject: `Website enquiry from ${name}`,
    text,
    replyTo: email || undefined,
  });

  return NextResponse.json({ ok: true });
}
