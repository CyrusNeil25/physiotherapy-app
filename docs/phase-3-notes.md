# Phase 3 — Payments + paid online consultations: notes

Built per `D:\Projects\Plans\16-physio-website.md` (Phase 3). Code-complete
and build-verified; **run `supabase/migrations/0003_consultations.sql` in the
SQL Editor before testing** (same as migrations 0001/0002).

## What exists

- **`/consult`** — intake form (consultation type, problem description, pain
  area, duration, history, consent checkbox) → creates a consultation +
  payment order.
- **Two payment modes, switched automatically:**
  - **Manual (active now, no setup):** patient sees "pay by UPI and share the
    screenshot on WhatsApp"; the doctor opens the thread and clicks **Mark as
    paid** — the consultation opens. Zero gateway dependency.
  - **Razorpay (activates when keys are set):** Razorpay Checkout opens after
    the intake form; the browser callback is signature-verified server-side
    (HMAC with the key secret), and the webhook
    (`/api/webhooks/razorpay`, event `payment.captured`) re-confirms
    idempotently — that's the production source of truth. Forged/unsigned
    webhooks get 400 (verified live).
- **`/consultation/[id]`** — the thread: pinned intake summary, chat-style
  messages, photo/PDF attachments (private `consultation-files` bucket,
  signed URLs, inline image previews), a "complete payment" resume button for
  abandoned Razorpay checkouts, and the doctor's action bar (**Mark as paid /
  Close / Refund**). Refund calls the Razorpay refund API when applicable.
- **`/admin/inbox`** — consultation queue sorted needs-reply-first, with an
  admin tab nav (Today | Inbox). Patient dashboard gained a "My online
  consultations" section.
- **Lifecycle:** `awaiting_payment → active ⇄ answered → closed | refunded`,
  with a 7-day window after payment (`CONSULT_WINDOW_DAYS` in
  `lib/consultations.ts`). Expired threads stop accepting messages and offer
  a follow-up CTA.
- **Emails** (Resend, or console in dev): doctor notified on payment and on
  patient messages; patient notified on doctor replies. Links only — no
  health content in email bodies.
- **Security posture:** patients can only insert `awaiting_payment`
  consultations (RLS blocks forging an active one), can only message/upload
  into their own *open* consultations, payment state is written exclusively
  by the service-role path, and checkout confirmation is HMAC-verified.

## To activate Razorpay later (optional — manual mode works today)

1. Create an account at dashboard.razorpay.com (test mode needs no KYC).
2. Settings → API Keys → generate; put in `.env.local`:
   `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
3. After deploying: Settings → Webhooks → add
   `<site-url>/api/webhooks/razorpay`, event `payment.captured`, secret →
   `RAZORPAY_WEBHOOK_SECRET`. (Skip locally — the checkout callback handles dev.)
4. Test with card 4111 1111 1111 1111, any future expiry/CVV, in test mode.

## Verified

- `npm run build` green (26 routes; marketing pages still static).
- Live server checks: `/consult`, `/consultation/*`, `/admin/inbox` all
  redirect signed-out users to login with the right `next` param; forged
  webhook POST → 400; home/services CTAs point at `/consult`.
- **Not yet tested with a live signed-in session** — needs migration 0003 run
  first. Test script: sign in → `/consult` → submit intake → see the
  "awaiting payment" banner → as the doctor, open it from `/admin/inbox` →
  **Mark as paid** → exchange messages with an image attachment both ways →
  **Close** → verify the patient can no longer post.

## Known follow-ups (Phase 4+)

- Live realtime chat (Supabase Realtime on `messages`) — currently the page
  refreshes on send; the other side sees new messages on reload/notification.
- Unread indicators, rating capture after close, auto-close cron for expired
  threads, earnings dashboard.
