import Link from "next/link";
import {
  site,
  services,
  testimonials,
  faqs,
  whatsappLink,
  formatInr,
} from "@/lib/site";
import { FaqList } from "@/components/faq-list";

const modeLabels: Record<string, string> = {
  clinic: "At the clinic",
  home_visit: "At your home",
  chat: "Online, from anywhere",
};

/** LocalBusiness structured data — helps "physiotherapist near me" searches */
function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "LocalBusiness"],
    name: site.name,
    description: `Physiotherapy clinic of ${site.doctor.name} — ${site.doctor.specializations.join(", ")}.`,
    url: site.url,
    telephone: site.phone,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line1,
      addressLocality: site.address.line2,
      addressCountry: "IN",
    },
    openingHours: ["Mo-Sa 09:00-13:00", "Mo-Sa 16:00-20:00"],
    medicalSpecialty: "Physiotherapy",
  };
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              {site.doctor.name} · {site.doctor.credentials}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              {site.tagline}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">
              Evidence-based physiotherapy for back &amp; neck pain, sports
              injuries and post-surgical recovery — at the clinic, at your
              home, or online from anywhere.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink(
                  `Hi ${site.doctor.shortName}, I'd like to book a physiotherapy appointment.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-teal-700 px-6 py-3.5 text-center text-base font-semibold text-white transition-colors hover:bg-teal-800"
              >
                Book a visit
              </a>
              <Link
                href="/services#online-consultation"
                className="rounded-full border border-teal-700 px-6 py-3.5 text-center text-base font-semibold text-teal-700 transition-colors hover:bg-teal-50"
              >
                Ask {site.doctor.shortName} online · {formatInr(499)}
              </Link>
            </div>
            <p className="mt-4 text-sm text-stone-500">
              {site.replyPromise} · {site.doctor.experienceYears}+ years of
              experience
            </p>
          </div>
        </div>
      </section>

      {/* Credentials strip */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {[
            {
              title: `${site.doctor.experienceYears}+ years experience`,
              text: "Hundreds of patients treated across orthopaedic and sports conditions.",
            },
            {
              title: site.doctor.credentials,
              text: `Registered physiotherapist (${site.doctor.registrationNumber}).`,
            },
            {
              title: "Honest treatment plans",
              text: "Clear session estimates and milestones — no open-ended packages.",
            },
          ].map((item) => (
            <div key={item.title}>
              <p className="text-base font-semibold text-stone-900">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-stone-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900">
          How I can help
        </h2>
        <p className="mt-2 max-w-2xl text-stone-600">
          Every treatment starts with a proper assessment — then a plan with
          clear goals you can measure.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/services#${s.slug}`}
              className="group flex flex-col rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                {modeLabels[s.mode]}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-stone-900 group-hover:text-teal-700">
                {s.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                {s.summary}
              </p>
              <p className="mt-4 text-sm font-semibold text-stone-900">
                {formatInr(s.priceInr)}{" "}
                <span className="font-normal text-stone-500">
                  · {s.duration}
                </span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How online consultation works */}
      <section className="bg-teal-700">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Can&apos;t visit the clinic? Ask online.
          </h2>
          <p className="mt-2 max-w-2xl text-teal-100">
            Get professional physiotherapy guidance without leaving home —
            ideal for advice, exercise plans and second opinions.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Describe your problem",
                text: "Fill a short form about your pain or injury and attach photos or reports if you have them.",
              },
              {
                step: "2",
                title: "Pay securely",
                text: `One-time fee of ${formatInr(499)} by UPI or card. Follow-ups are ${formatInr(299)}.`,
              },
              {
                step: "3",
                title: "Get expert guidance",
                text: `${site.doctor.shortName} replies personally in a private thread — ${site.replyPromise.toLowerCase()}.`,
              },
            ].map((s) => (
              <div key={s.step}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-teal-700">
                  {s.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-teal-100">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/services#online-consultation"
            className="mt-10 inline-block rounded-full bg-white px-6 py-3.5 text-base font-semibold text-teal-800 transition-colors hover:bg-teal-50"
          >
            Start an online consultation
          </Link>
          <p className="mt-4 text-xs text-teal-200">
            Online guidance does not replace a physical examination where one
            is needed — and you&apos;ll be told honestly when it is.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900">
          What patients say
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-xl border border-stone-200 bg-stone-50 p-6"
            >
              <blockquote className="text-sm leading-relaxed text-stone-700">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4">
                <p className="text-sm font-semibold text-stone-900">{t.name}</p>
                <p className="text-xs text-stone-500">{t.context}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900">
              Common questions
            </h2>
            <p className="mt-2 text-stone-600">
              Everything about visits, online consultations and what to
              expect.
            </p>
            <Link
              href="/faq"
              className="mt-4 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              See all questions →
            </Link>
          </div>
          <FaqList items={faqs.slice(0, 4)} />
        </div>
      </section>

      {/* Location */}
      <section className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900">
              Visit the clinic
            </h2>
            <p className="mt-4 text-stone-700">
              {site.address.line1}
              <br />
              {site.address.line2}
            </p>
            <ul className="mt-4 space-y-1 text-sm text-stone-600">
              {site.hours.map((h) => (
                <li key={`${h.days}-${h.time}`}>
                  <span className="font-medium text-stone-700">{h.days}:</span>{" "}
                  {h.time}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.mapsQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-teal-700 px-5 py-2.5 text-center text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50"
              >
                Get directions
              </a>
              <Link
                href="/contact"
                className="rounded-full bg-teal-700 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-teal-800"
              >
                Contact us
              </Link>
            </div>
          </div>
          <iframe
            title="Clinic location map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(site.address.mapsQuery)}&output=embed`}
            className="h-64 w-full rounded-xl border border-stone-200 md:h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
