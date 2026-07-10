# Restore Physiotherapy — practice website

Website for a physiotherapy practice: info pages, paid online chat
consultations, and appointment booking. Master plan:
`D:\Projects\Plans\16-physio-website.md`.

**Status:** Phase 1 (marketing site) and Phase 2 (auth + booking) built.
Phase 2 needs a Supabase project connected before it runs live — see
`docs/phase-2-notes.md` for the ~5 minute setup. Phases 3–5 (payments, paid
chat, blog) pending.

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
