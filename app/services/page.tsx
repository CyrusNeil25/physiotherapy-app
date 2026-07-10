import type { Metadata } from "next";
import Link from "next/link";
import { site, services, formatInr } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description:
    "Physiotherapy services and transparent pricing — clinic sessions, home visits and online chat consultations.",
};

const modeLabels: Record<string, string> = {
  clinic: "At the clinic",
  home_visit: "At your home",
  chat: "Online, from anywhere",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-stone-900">
        Services &amp; pricing
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-stone-600">
        Transparent, per-session pricing — no packages you don&apos;t need.
        Every treatment starts with a proper assessment.
      </p>

      <div className="mt-12 space-y-10">
        {services.map((s) => (
          <section
            key={s.slug}
            id={s.slug}
            className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8"
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  {modeLabels[s.mode]}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-stone-900">
                  {s.name}
                </h2>
              </div>
              <p className="shrink-0 text-lg font-bold text-stone-900">
                {formatInr(s.priceInr)}{" "}
                <span className="text-sm font-normal text-stone-500">
                  · {s.duration}
                </span>
              </p>
            </div>

            <p className="mt-3 text-base leading-relaxed text-stone-600">
              {s.summary}
            </p>

            <ul className="mt-5 space-y-2">
              {s.details.map((d) => (
                <li key={d} className="flex gap-3 text-sm text-stone-700">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-teal-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {d}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {s.mode === "chat" ? (
                <>
                  <Link
                    href="/consult"
                    className="inline-block rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
                  >
                    Start online consultation
                  </Link>
                  <p className="mt-3 text-xs text-stone-500">
                    {site.replyPromise}. Online consultation is for guidance
                    and advice — not for emergencies, and it doesn&apos;t
                    replace a physical examination where one is needed.
                  </p>
                </>
              ) : (
                <Link
                  href="/book"
                  className="inline-block rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
                >
                  Book this service
                </Link>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
