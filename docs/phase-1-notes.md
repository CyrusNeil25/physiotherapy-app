# Phase 1 — Marketing site: notes

Built per `D:\Projects\Plans\16-physio-website.md` (Phase 1).

## What exists

- Public pages: home, about, services (with per-service anchors), FAQ, contact,
  plus trust pages: `/disclaimer`, `/privacy-policy`, `/refund-policy`, `/terms`.
- Floating WhatsApp button on every page; all "Book" CTAs currently deep-link to
  WhatsApp with a pre-filled message (Phase 2 replaces these with real booking).
- The "Start online consultation" CTA also goes to WhatsApp for now — Phase 3
  replaces it with the paid intake + chat flow.
- Contact form → `POST /api/contact` → Resend when `RESEND_API_KEY` is set,
  otherwise logs to the server console (dev mode). Honeypot spam field included.
- SEO: per-page metadata, `sitemap.xml`, `robots.txt`, LocalBusiness/MedicalBusiness
  JSON-LD on the home page.

## Placeholder content to replace before launch

Everything lives in **`lib/site.ts`** — one file:

- [ ] Her real name, credentials and **registration number**
- [ ] Real phone + WhatsApp number (`whatsappNumber` is digits-only with country code)
- [ ] Real email (`contactEmail`) + set `CONTACT_TO_EMAIL` env var
- [ ] Real clinic address + `mapsQuery` for the map embed
- [ ] Real clinic hours (also update `openingHours` in `app/page.tsx` JSON-LD if changed)
- [ ] Real services and prices
- [ ] Real testimonials (with patient consent) and FAQ answers
- [ ] Her bio + professional photo on `/about` (photo placeholder is marked TODO)
- [ ] `NEXT_PUBLIC_SITE_URL` env var on Vercel after the domain is connected

## Verified

- `npm run build` green; all 9 routes static, `/api/contact` dynamic.
- Desktop + 375px mobile layouts checked in browser; mobile menu works.
- Contact form happy path tested end-to-end (dev mode).
- No browser console errors.

## Next: Phase 2

Auth + booking (Supabase project, schema + RLS, availability admin, booking flow).
See the master plan §7 Phase 2.
