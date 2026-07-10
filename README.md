# Restore Physiotherapy — practice website

Website for a physiotherapy practice: info pages, paid online chat
consultations, and appointment booking. Master plan:
`D:\Projects\Plans\16-physio-website.md`.

**Status:** Phases 1–4 built: marketing site, auth (email+password) +
booking, paid online consultations (manual-payment mode out of the box;
Razorpay activates via env keys), and live realtime chat with read receipts,
ratings, auto-close cron and an earnings dashboard. Run all four files in
`supabase/migrations/` in order. Phase 5 (blog, content pass, launch)
pending. See `docs/phase-N-notes.md` for each phase.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase (auth,
Postgres, RLS) · deployed on Vercel. Later phases add Razorpay and Supabase
Realtime for live chat.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build check
```

Copy `.env.example` to `.env.local` and fill what you need. The contact form
works without any keys in dev (logs to console); the marketing pages work
with zero configuration. `/book`, `/dashboard` and `/admin` need a connected
Supabase project — see `docs/phase-2-notes.md`.

## Editing practice details

All names, prices, hours, contact details and FAQ content live in
**`lib/site.ts`**. Page copy lives in `app/**/page.tsx`. Placeholders that must
be replaced before launch are listed in `docs/phase-1-notes.md`. 
