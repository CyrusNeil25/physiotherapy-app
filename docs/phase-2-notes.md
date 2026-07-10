# Phase 2 — Auth + booking: notes

Built per `D:\Projects\Plans\16-physio-website.md` (Phase 2). Code-complete;
**not yet connected to a live Supabase project** — see setup steps below.

## What exists

- **Auth:** email magic-link sign-in (`/login`), callback handler
  (`/auth/callback`), sign-out (`/auth/signout`). No passwords. A `profiles`
  row is auto-created for every new user (`role` defaults to `patient`).
- **Booking (`/book`):** pick a bookable service → pick a date (next 14 days)
  → pick a free time slot → confirm. Slots are computed from
  `availability_rules` + `availability_exceptions` + existing bookings via
  `GET /api/availability`. **Double-booking is prevented at the database
  level** with a Postgres `EXCLUDE` constraint on the booking time range
  (`supabase/migrations/0001_init.sql`) — even a race between two concurrent
  requests can't both succeed; the loser gets "that slot was just taken."
  A confirmation email is sent (or logged, in dev) on success.
- **Patient dashboard (`/dashboard`):** list of the signed-in patient's own
  bookings with status.
- **Admin (`/admin`):** gated to `profiles.role = 'admin'`. Shows today's and
  the next 7 days' bookings across all patients, with confirm / mark done /
  cancel actions (`app/admin/actions.ts`).
- **RLS is on for every table** — patients can only ever see their own
  `profiles` and `bookings` rows; `services`/`availability_*` are public-read,
  admin-write. The `/api/availability` route intentionally uses the
  service-role client (bypasses RLS) because computing "what's free" needs to
  see all patients' bookings for a day — it returns only time ranges, never
  who booked them.
- **Graceful degradation:** if Supabase env vars aren't set, the middleware
  and header skip auth entirely rather than crashing — the Phase 1 marketing
  site keeps working standalone. Only the new pages that genuinely need a
  backend (`/book`, `/dashboard`, `/admin`) show an error until connected.

## Required: connect a Supabase project (one-time, ~5 minutes)

This is the one step only you can do — it needs your own account.

1. Go to [supabase.com](https://supabase.com), sign up free, **New project**
   (pick any name/region/password — save the DB password somewhere safe).
2. Wait ~2 min for provisioning, then open **SQL Editor** → paste the full
   contents of `supabase/migrations/0001_init.sql` → **Run**. This creates
   all tables, the double-booking constraint, and RLS policies, and seeds the
   4 bookable services + weekly availability template.
3. Go to **Project Settings → API** and copy three values into a new
   `.env.local` file (copy `.env.example` as a starting point):
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (Reveal) → `SUPABASE_SERVICE_ROLE_KEY` — **keep this
     one secret, never commit it or expose it client-side.**
4. Restart `npm run dev`. Sign in once via `/login` with your own email to
   create your `profiles` row, then in the Supabase **Table Editor** open
   `profiles` and change your row's `role` from `patient` to `admin` — that's
   how you get into `/admin`.
5. (Optional, for real emails) Add `RESEND_API_KEY` — see Phase 1 notes.

## Known follow-ups (not done yet)

- Booking **reminder email** (day-before, needs a Vercel Cron job) — deferred
  to keep this phase testable without extra deploy-time config; confirmation
  emails on booking creation are done.
- Availability admin UI (edit hours / block dates from `/admin`) — currently
  editable only via the Supabase Table Editor directly. Small addition when
  needed.
- Regenerate `lib/supabase/types.ts` from the real project once it exists:
  `npx supabase gen types typescript --project-id <ref>` (see comment at top
  of that file) — the hand-written version will drift if the schema changes.

## Verified

- `npm run build` green; static marketing pages (9 routes) still prerender,
  new auth/booking/admin routes are correctly dynamic.
- Confirmed in-browser: homepage and `/login` render correctly with **no**
  Supabase configured (previously this crashed site-wide via middleware —
  fixed in `lib/supabase/middleware.ts` and `components/header.tsx`).
- Confirmed `/book` fails in isolation (expected) without live credentials,
  without affecting any other route.
- **Not yet tested against a real Supabase project** — the sign-in flow,
  slot booking, exclusion-constraint conflict handling, and admin actions
  need a live run once you've completed the setup steps above. Do that
  next, then exercise: sign in → book a slot → try to book the same slot in
  a second tab (should fail) → confirm it from `/admin`.

## Next: Phase 3

Payments + paid chat consultations (Razorpay, intake form with uploads,
consultation threads). See the master plan §7 Phase 3.
