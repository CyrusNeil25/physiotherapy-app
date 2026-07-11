# Phase 4b — Admin improvements: notes

Four improvements on top of Phase 4. **Run
`supabase/migrations/0005_scheduling_availability.sql` before testing —
new consultations can't be created until you do** (see below).

## 1. Unread-message indicator in the admin panel

- The **Inbox tab** in admin now shows a live badge count of unread patient
  messages (`components/admin-nav.tsx`), updated instantly via Supabase
  Realtime — no refresh needed.
- The **browser tab title** prefixes `(N)` when there's anything unread
  (e.g. `(3) Restore Physiotherapy — Admin`) — visible even when she's on a
  different tab, matching Gmail/WhatsApp Web-style ambient notification.

## 2. UPI QR code at payment (manual-payment mode)

- `components/upi-qr.tsx` — a server-rendered QR (via the `qrcode` package)
  encoding a standard `upi://pay?...` deep link with the amount and a
  reference note pre-filled. Shown on the consultation thread's
  "awaiting payment" banner instead of the old plain-text instructions.
- Patients can **scan with any UPI app** (GPay/PhonePe/Paytm/BHIM) or, on
  mobile, **tap "Pay in UPI app"** to jump straight into their UPI app with
  everything pre-filled — no manually typing the doctor's UPI ID.
- She still confirms receipt manually via **Mark as paid** — the QR just
  makes the actual paying step faster; it doesn't change the confirmation
  flow (same "share the screenshot on WhatsApp" step as before).
- **Set the real UPI ID**: `lib/site.ts` → `upiId` (currently a placeholder,
  `restore.physio@okaxis`).

## 3. Schedule an online chat

- The `/consult` intake form now asks **"When would you like to chat?"** —
  "As soon as possible" (the existing async behaviour, unchanged) or
  "Schedule a specific time" (a date + half-hour time picker across her
  working hours, next 14 days, via the new `/api/chat-schedule` endpoint).
- Deliberately **not** built on the booking/slot-exclusion system used for
  clinic visits — a chat doesn't block a physical resource, so multiple
  patients can schedule the same time; it's just an expectation-setting
  timestamp (`consultations.scheduled_at`), not a hard reservation.
- Shown prominently — 📅 banner — on both the patient's thread page and the
  doctor's inbox list, and mentioned in her "new paid consultation" email.

## 4. Chat-availability toggle

- A small pill switch in the admin nav bar: **Available for chat / Unavailable
  for chat** (`components/chat-availability-toggle.tsx`), backed by a new
  singleton `clinic_settings` table (deliberately not a `profiles` column —
  patients need to read this flag, and a broader profiles-read policy would
  have exposed her phone/name via RLS).
- When she's marked unavailable, `/consult` shows a banner telling the
  patient she's currently unavailable for *live* chat but they can still
  submit a consultation (async) or schedule a specific time — it does not
  block starting a consultation.

## ⚠️ Required: run the migration first

`app/consult/actions.ts`'s `startConsultation` now unconditionally writes to
`consultations.scheduled_at` on every insert — **without migration 0005,
patients cannot start any new consultation at all**, not just the scheduling
feature. Run it before testing anything in this batch.

Everything else degrades gracefully pre-migration (the availability toggle
and unread badge simply default to "available"/0 if `clinic_settings`
doesn't exist yet) — only consultation *creation* hard-fails.

## Verified

- `npm run build` green (30 routes).
- Live: `/api/chat-schedule?date=...` returns correct half-hour slots
  starting at her seeded working hours (09:00 IST); missing `date` → 400.
- `/admin/login` unaffected by these changes.
- **Not yet tested end-to-end** (needs migration 0005 + a live session):
  submit a scheduled consultation → pay manually → confirm the QR scans
  correctly in a real UPI app → doctor sees the scheduled banner + unread
  badge updates live → toggle availability and confirm the `/consult`
  banner reflects it.
