# Phase 4 — Live chat + lifecycle polish: notes

Built per `D:\Projects\Plans\16-physio-website.md` (Phase 4). **Run
`supabase/migrations/0004_realtime_polish.sql` in the SQL Editor** before
testing — it adds read tracking and enables the Realtime feeds.

## What exists

- **Live chat:** the consultation thread subscribes to Supabase Realtime
  (`components/message-list.tsx`) — new messages appear instantly in both
  browsers, no refresh. RLS still applies to the change feed: subscribers
  only receive rows their JWT can SELECT. Status changes (paid / closed /
  refunded) also stream live and re-render the page shell.
- **Read receipts:** opening a thread marks the other party's messages read
  (`read_at`); senders see ✓ Sent / ✓✓ Read ticks that flip live. Unread
  counts show as "N new" badges on the patient dashboard and the admin inbox.
- **Ratings:** after the doctor closes a consultation, the patient gets a
  1–5 star form (+ optional comment) on the thread page; the doctor sees the
  rating read-only. One rating per consultation, enforced server-side.
  Surfacing good ratings as website testimonials is a Phase 5 content task.
- **Auto-close:** `/api/cron/close-expired` (bearer-secret protected) closes
  active threads past their 7-day window; `vercel.json` schedules it daily at
  3:00 AM IST. Set `CRON_SECRET` on Vercel (and locally to test via curl).
- **Earnings tab** in admin: this month / last month / all-time totals,
  per-service breakdown, refund total, and the recent payments list. Counts
  online-consultation payments only (clinic visits are paid in person).

## Verified

- Production build green; all routes compile.
- Auth gating and page rendering verified server-side.
- **Realtime needs a live two-browser test** (can't be simulated without two
  signed-in sessions): open the same consultation as patient (normal window)
  and doctor (incognito), send messages both ways — they should appear
  instantly, and the sender's ✓ should flip to ✓✓ while the other side has
  the thread open.

## Test script (after running migration 0004)

1. Patient window + doctor incognito window on the same consultation.
2. Messages appear live in both directions; ticks flip to ✓✓ Read.
3. Doctor closes the thread → patient's composer locks (live) → rating form
   appears → submit 5 stars → doctor sees the rating.
4. Dashboard/inbox show "N new" badges when the other side messaged while
   you were away; opening the thread clears them.
5. Earnings tab shows the test payments.
6. Cron: `curl -H "Authorization: Bearer <CRON_SECRET>" <url>/api/cron/close-expired`
   → `{"ok":true,"closed":N}`.

## Next: Phase 5

Blog + launch: DB-backed posts with an admin editor, sitemap/OG polish,
analytics, real content pass (her registration number, phone, WhatsApp,
email, bio are still placeholders in `lib/site.ts`), Razorpay live keys,
domain + Google Business Profile, owner's manual.
