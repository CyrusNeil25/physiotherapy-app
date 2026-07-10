# Project 16 — Physiotherapy Practice Website ("Restore By Preeti")

> A real website for a real client: a physiotherapist's practice site with credible info pages (services, credentials, testimonials, FAQ), **paid chat consultations** (patient pays online → opens a private thread with photo/report uploads → she replies from a simple admin inbox, upgradeable to live real-time chat), and **appointment booking** against her availability calendar. Built to run at ~₹0/month on free tiers, operable by a non-technical owner from her phone.

**Track:** Real Product (client work — not a resume-track project, though it still demos well)
**Difficulty:** Easy–Medium
**Time budget:** 3–4 weeks part-time
**Repo name suggestion:** `restore-physio`

> **Assumptions baked in (change here if wrong):** practice is India-based → Razorpay (UPI/cards/netbanking) and INR pricing; chat consultations are asynchronous-first (she replies within a promised window, e.g. 24h) with live chat added on the same data model in Phase 4; booking is for clinic/home visits and can be pay-at-clinic (online payment optional per service).

---


## 1. The Real-World Problem This Solves

A solo physiotherapist's business runs on word of mouth, Google searches ("physiotherapist near me"), and WhatsApp chaos. She has no credible web presence, no way to monetize the free advice she constantly gives over WhatsApp, and no structured booking — everything is manual back-and-forth.

This site fixes three things, in order of business value:

1. **Credibility & discovery** — a professional site with her credentials, services, prices, testimonials, and location. This alone converts Google searches and Instagram bios into patients.
2. **Paid consultations** — the advice she gives away free on WhatsApp becomes a product: pay ₹X, describe your problem with photos/reports, get her professional guidance in a private thread. Async-first means she answers on her schedule, not live.
3. **Structured booking** — patients book real slots from her actual availability instead of negotiating times over calls.

The design constraint that shapes everything: **the owner is not technical.** Every admin flow must be phone-friendly, plain-language, and forgiving. If she can use WhatsApp, she must be able to use this.

## 2. What This Delivers (client outcomes)

- A deployed site on her own domain she can share on Instagram/Google Business Profile from day one (Phase 1 alone is shippable).
- A new revenue stream: paid chat consultations with online payment, receipts, and a response-time promise.
- Fewer phone calls: bookings, prices, directions, and FAQs are self-serve.
- An admin panel she actually uses: today's bookings, open consultations to answer, earnings this month.
- Total running cost ≈ ₹0/month + domain (~₹800/yr), until traffic justifies paid tiers.

## 3. Tech Stack

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui. One codebase for public site, patient area, and admin. Deployed on **Vercel** (free tier).
- **Backend-as-a-service: Supabase** — Postgres (all data), Auth (email magic-link/OTP + Google; `patient`/`admin` roles), **Realtime** (live chat in Phase 4 with zero custom WebSocket infra), Storage (private bucket for photos/reports, signed URLs).
- **Payments: Razorpay** (Checkout + Orders API + webhooks). All payment logic behind a small provider-agnostic module (`lib/payments/`) exposing `createOrder / verifyWebhook / refund` so Stripe can be swapped in for a non-India deployment. A **manual-payment mode** (she marks "payment received" for UPI-direct patients) works before the gateway is approved and as a fallback.
- **Email: Resend** (free tier) — booking confirmations, "you have a reply" notifications, receipts. No health details in any email, ever — links only.
- **Analytics:** Vercel Analytics or Plausible. **Images:** `next/image` + Supabase storage.
- Explicitly NOT used: no Docker/Terraform ceremony (Supabase cloud + Vercel is the ops story), no Redis, no queues. This is a small-business site; boring and cheap wins.

## 4. Functional Requirements

### 4.1 Public site (the credibility layer)
- **Home:** hero with her name/specialization + photo, services grid with prices, credentials strip (degrees, registration number, years of experience), testimonials, prominent CTAs ("Book a visit" / "Ask me online"), clinic location + hours.
- **About:** qualifications, specializations (sports rehab, back/neck pain, post-surgical, pediatric/geriatric — whatever applies), approach/philosophy, photo.
- **Services:** one section per service with description, duration, price, and mode (clinic visit / home visit / online chat / video). Each has its own CTA into booking or consultation flow.
- **Contact:** address with embedded map, hours, phone, WhatsApp deep-link button (floating on mobile), simple contact form → email.
- **FAQ:** accordion (what to bring, insurance, how online consultation works, cancellation policy).
- **Trust pages:** medical disclaimer, privacy policy, refund/cancellation policy, terms. Footer-linked, plain language.
- SEO: proper metadata, OG images, sitemap, JSON-LD (`Physiotherapy`/`LocalBusiness` schema — this materially helps "near me" searches), fast LCP on mobile.

### 4.2 Patient accounts
- Sign in with email magic-link/OTP or Google. Profile: name, phone. No passwords to support.
- Dashboard: my consultations (with status), my bookings, my payments/receipts.
- Auth required only at the moment of paying or booking — browsing is anonymous.

### 4.3 Paid chat consultation (the centerpiece)
Flow: pick a chat service (e.g., "New consultation — ₹499", "Follow-up — ₹299") → sign in → **intake form** (problem description, pain area picker, duration, relevant history, photo/report uploads — images and PDFs) → consent checkbox (disclaimer text) → Razorpay checkout → on webhook-confirmed payment the consultation becomes **active** and she's notified by email.

- **The thread:** private conversation view; patient and physio both post text + attachments. Async-first: patient is told the response promise ("replies within 24 hours, Mon–Sat"). Every reply triggers an email notification to the other side (link only, no content).
- **Lifecycle:** `awaiting_payment → active → answered → closed`. A consultation stays open for a defined window (e.g., 5 exchanges or 7 days, configurable per service) then auto-closes; patient may rate 1–5 + comment. She can close early or extend.
- **Safety rails:** intake and thread UI carry a persistent "not for emergencies" notice; consent is recorded with timestamp; she can refund from the admin panel (calls provider refund + sets status `refunded`).
- **Phase 4 upgrade — live chat:** same `messages` table, Supabase Realtime subscription turns the thread into instant chat with delivered/read ticks and unread badges. Presence ("online now") optional. No architectural change — this is why messages live in Postgres from day one.

### 4.4 Appointment booking
- **Her availability:** weekly template (e.g., Mon–Sat 09:00–13:00, 16:00–20:00) + date exceptions (holidays, blocked days). Slot length derives from the service's duration.
- **Patient flow:** pick service → pick mode (clinic/home visit) → calendar shows only genuinely free slots → confirm (optionally pay online, or "pay at clinic" per service config) → email confirmation to both.
- **Integrity:** double-booking is impossible at the database level (exclusion constraint on the time range), not just hidden in the UI.
- **Lifecycle:** `pending → confirmed → completed | cancelled | no_show`. She confirms/cancels from admin; patient can cancel per policy. Reminder email day before (Vercel cron).

### 4.5 Admin panel (design for a non-technical owner)
- **Today view (default screen):** today's bookings + consultations awaiting her reply. Big touch targets; works one-handed on a phone.
- **Inbox:** open consultations sorted by "waiting longest"; thread view with intake summary pinned at top; reply with text/attachments; close/extend/refund buttons.
- **Schedule:** week calendar of bookings; edit availability template; block dates.
- **Patients:** list with consultation/booking history; **private clinical notes** per patient (admin-only, never patient-visible).
- **Earnings:** this month / last month, per-service breakdown, payments list with receipt links.
- **Content:** edit services & prices, testimonials, FAQ entries, blog posts — all DB-backed so she never needs a developer for a price change.

### 4.6 Blog (SEO engine)
- DB-backed posts with a minimal editor (markdown with preview is fine), cover image, excerpt, publish toggle.
- Purpose: articles like "5 exercises for lower back pain — and when to stop" rank on Google and feed the consultation funnel. Each post ends with a consultation CTA.

## 5. Non-Functional Requirements

- **Mobile-first, genuinely:** her patients arrive from Instagram and WhatsApp on phones. Design at 360px first; desktop is the adaptation. Lighthouse mobile ≥ 90 on public pages.
- **Health-data privacy:** patients' intake text, messages, and uploads are sensitive. Row-Level Security on every patient-scoped table (patients read/write only their own rows; admin role reads all). Storage bucket private; attachments served via short-lived signed URLs. No health content in emails or push text. HTTPS everywhere (default on Vercel).
- **Payment correctness:** the Razorpay **webhook is the single source of truth** — signature-verified, idempotent (keyed on `order_id`), and the only thing that activates a consultation or marks a booking paid. Client-side checkout success callbacks are UX sugar only.
- **Honest medical posture:** visible disclaimers (online advice doesn't replace physical examination; not for emergencies), her registration number displayed, consent recorded per consultation. Keep claims modest — this is a licensed professional's public face.
- **Ops:** all state in Supabase (survives redeploys trivially); weekly automated DB backup (Supabase built-in); UptimeRobot on the homepage; `.env.example` documenting every secret.

## 6. Data Model (core)

```sql
profiles(id uuid pk refs auth.users, full_name, phone, role /*patient|admin*/, created_at)
services(id, slug, name, description, mode /*chat|clinic|home_visit|video*/, price_inr int,
         duration_min, pay_online bool, reply_window_hours int null, active bool, sort)
consultations(id, patient_id, service_id, status /*awaiting_payment|active|answered|closed|refunded*/,
              intake jsonb /*problem, pain_area, duration, history*/, consent_at,
              opened_at null, expires_at null, closed_at null, rating int null, rating_comment null)
messages(id, consultation_id, sender_id, body text, attachments jsonb, read_at null, created_at)
payments(id, patient_id, consultation_id null, booking_id null, provider /*razorpay|manual*/,
         provider_order_id, provider_payment_id null, amount_inr, status /*created|paid|failed|refunded*/,
         raw jsonb, created_at)          -- exactly one of consultation_id/booking_id set
availability_rules(id, weekday int, start_time, end_time)
availability_exceptions(id, date, closed bool, note)
bookings(id, patient_id, service_id, starts_at timestamptz, ends_at timestamptz, mode,
         status /*pending|confirmed|completed|cancelled|no_show*/, patient_note null, payment_id null,
         EXCLUDE USING gist (tstzrange(starts_at, ends_at) WITH &&)
                 WHERE (status IN ('pending','confirmed')))   -- double-booking impossible
patient_notes(id, patient_id, author_id, body, created_at)     -- clinical notes, admin-only RLS
testimonials(id, author_name, body, sort, published bool)
faqs(id, question, answer, sort, published bool)
posts(id, slug, title, excerpt, body_md, cover_url, published_at null)
```

## 7. Build Phases

**Phase 1 — Marketing site (week 1):** Next.js scaffold, all public pages (home, about, services, contact, FAQ, trust pages) with content placeholders she can review, WhatsApp button, contact form → email, SEO (metadata, sitemap, JSON-LD), deploy to Vercel on her domain. *Exit: a live URL she can put in her Instagram bio today; Lighthouse mobile ≥ 90.*

**Phase 2 — Auth + booking (week 2):** Supabase project, schema + RLS, magic-link/Google auth, availability admin (template + exceptions), booking flow with DB-level slot integrity, patient dashboard v1, admin Today view + schedule, confirmation + reminder emails. *Exit: end-to-end booking demo — two patients cannot take the same slot even racing; she can confirm/cancel from her phone.*

**Phase 3 — Payments + paid consultations (week 3):** services CMS, `lib/payments/` with Razorpay (test mode) + manual mode, intake form with uploads (private bucket, signed URLs), webhook handler (verified, idempotent), consultation threads (async), admin inbox, reply notifications, receipts, refund action. *Exit: full happy path in Razorpay test mode — pay → thread opens → she replies from admin → patient notified; a replayed/forged webhook does nothing.*

**Phase 4 — Live chat + lifecycle polish (week 4):** Supabase Realtime on `messages` (instant delivery, unread badges, read ticks), consultation auto-close job (Vercel cron), rating capture, earnings dashboard. *Exit: two browsers chat in real time; closed consultations lock correctly; ratings appear (with consent) as testimonial candidates.*

**Phase 5 — Blog + launch:** post editor + public blog with CTAs, analytics, final content pass with her real copy/photos/prices, Razorpay live keys + live webhook URL, Google Business Profile link-up, backup + uptime monitoring, a 1-page plain-language "owner's manual" for her. *Exit: real site, real payments, she has answered one real paid consultation without your help.*

## 8. Stretch Goals

- **Video consultations:** paid booking auto-creates and emails a Google Meet link; no in-app video needed to start.
- **Exercise library:** she assigns exercise programs (video links, sets/reps, PDF) to a patient; patient checks off sessions; adherence visible on her patient view.
- **WhatsApp notifications** (WhatsApp Business Cloud API) for booking confirmations/reminders — dramatically better open rates in India than email.
- **GST-compliant PDF invoices** if her turnover requires it; **multi-language** (Hindi + regional) for the public pages.
- **A second physio:** the schema is one-provider; a `providers` table + provider_id scoping turns it into a small clinic product.

## 9. Content Checklist (she must provide — request in week 1)

Bio + professional photo; qualifications and registration number; service list with prices and durations; clinic address, hours, phone; 3–6 testimonials (with patient consent); FAQ answers; policy decisions: reply-time promise for chat consultations, consultation window (days/exchanges), cancellation/refund rules; domain name choice.

## 10. Definition of Done

- [ ] Live on her custom domain, HTTPS, Lighthouse mobile ≥ 90 on public pages
- [ ] Paid consultation happy path verified with a real ₹ payment (then refunded); webhook forgery/replay test documented
- [ ] RLS verified by test: patient A cannot read patient B's consultations, messages, uploads, or notes (automated test, not a manual check)
- [ ] Double-booking impossible under concurrent requests (test hits the exclusion constraint)
- [ ] She has, unassisted from her phone: changed a price, blocked a holiday, confirmed a booking, answered a consultation, issued a refund
- [ ] Owner's manual delivered; backups + uptime monitoring on; `.env.example` complete
- [ ] Playwright e2e: booking happy path + consultation happy path (Razorpay test mode) green in CI

## 11. Instructions for the AI Implementer (Claude Opus/Sonnet)

1. **Payment truth lives in the webhook.** Verify the Razorpay signature; handler is idempotent (upsert keyed on `provider_order_id`); consultations/bookings change state ONLY via the webhook (or an explicit admin "manual payment received" action, audit-logged). Write the forged-signature and duplicate-delivery tests before wiring the UI callback.
2. **RLS is the security model — write it first, test it always.** Every patient-scoped table gets policies the day it's created; add an automated cross-tenant test (patient A vs patient B) that runs in CI. `patient_notes` is admin-only: verify a patient token can never select it. Storage bucket private; only signed URLs, short expiry.
3. **`lib/payments/` is provider-agnostic:** `createOrder`, `verifyWebhook`, `refund` — Razorpay implements it; `manual` implements it trivially; Stripe is a future file, not a refactor.
4. **Slot integrity at the DB layer:** the `tstzrange` exclusion constraint is the guarantee; the API catches the conflict error and returns "slot just taken." Never rely on a free-slots query alone.
5. **Async-first chat, Realtime later:** messages are plain Postgres rows from Phase 3; Phase 4 only adds a Realtime subscription + optimistic UI. Do not build a custom WebSocket server; do not put messages anywhere but Postgres.
6. **The admin is the product for the client.** Plain language ("Reply to Anjali", not "Update consultation entity"), big touch targets, mobile-first, zero jargon, confirmation dialogs on destructive actions. If a screen needs explaining, redesign it.
7. **No health data leaves the database:** emails/notifications say "you have an update" + link. Never include intake text, message content, or attachment previews in email, logs, or analytics events.
8. **Mobile first, always:** build every screen at 360px before desktop. The public pages must be fast on a mid-range Android over 4G — measure, don't assume.
9. **Content is data:** services, prices, testimonials, FAQs, posts are DB rows editable in admin. She must never need a deploy for a price change. Seed script provides realistic demo content (placeholder physio persona) so every phase demos well before her real content lands.
10. Each phase ends deployed to a preview URL, smoke-tested on a real phone, with a short `docs/phase-N-notes.md`.
