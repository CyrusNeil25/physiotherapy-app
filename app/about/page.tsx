import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Meet ${site.doctor.name} (${site.doctor.credentials}) — registered physiotherapist with ${site.doctor.experienceYears}+ years of experience.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            About {site.doctor.shortName}
          </h1>
          <p className="mt-2 text-lg text-teal-700">
            {site.doctor.credentials} · {site.doctor.registrationNumber}
          </p>

          <div className="mt-8 space-y-5 text-base leading-relaxed text-stone-700">
            {/* TODO: replace with her real bio, in her voice */}
            <p>
              I&apos;m {site.doctor.name}, a registered physiotherapist with
              over {site.doctor.experienceYears} years of clinical experience
              in orthopaedic and sports physiotherapy. I completed my
              Bachelor&apos;s and Master&apos;s in Physiotherapy with a
              specialisation in orthopaedics, and have since treated hundreds
              of patients — from office workers with chronic neck pain to
              athletes returning from surgery.
            </p>
            <p>
              My approach is simple: <strong>assess properly, treat what
              matters, and teach you to stay better.</strong> Passive
              treatments alone rarely fix anything. Every plan I make combines
              hands-on therapy with exercises you can realistically do at
              home, and clear milestones so you always know where you stand.
            </p>
            <p>
              I believe patients deserve honesty. If you need three sessions,
              I&apos;ll say three — not ten. And if your problem needs a
              doctor or a scan before physiotherapy can help, I&apos;ll tell
              you that too.
            </p>
          </div>

          <h2 className="mt-12 text-2xl font-bold text-stone-900">
            Specialisations
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {site.doctor.specializations.map((s) => (
              <li
                key={s}
                className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-800"
              >
                {s}
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-teal-700 px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-teal-800"
            >
              Book a visit
            </a>
            <Link
              href="/services#online-consultation"
              className="rounded-full border border-teal-700 px-6 py-3 text-center text-base font-semibold text-teal-700 transition-colors hover:bg-teal-50"
            >
              Consult online
            </Link>
          </div>
        </div>

        <aside>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">
            <Image
              src="/Preeti-portfolio.png"
              alt={site.doctor.name}
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Qualifications
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>Master of Physiotherapy (Orthopaedics)</li>
              <li>Bachelor of Physiotherapy</li>
              <li>Certified in dry needling &amp; kinesio taping</li>
              <li>{site.doctor.registrationNumber}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
