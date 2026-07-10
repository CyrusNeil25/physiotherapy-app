import type { Metadata } from "next";
import { site, whatsappLink } from "@/lib/site";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.name} — location, clinic hours, phone and WhatsApp.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-stone-900">
        Contact
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-stone-600">
        The fastest way to reach us is WhatsApp — or send a message with the
        form below and you&apos;ll get a reply within one working day.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <ContactForm />
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Reach us directly
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-stone-700">
              <li>
                <span className="font-medium text-stone-900">WhatsApp: </span>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-700 hover:text-teal-800"
                >
                  Message us on WhatsApp
                </a>
              </li>
              <li>
                <span className="font-medium text-stone-900">Phone: </span>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-teal-700 hover:text-teal-800">
                  {site.phone}
                </a>
              </li>
              <li>
                <span className="font-medium text-stone-900">Email: </span>
                <a href={`mailto:${site.contactEmail}`} className="text-teal-700 hover:text-teal-800">
                  {site.contactEmail}
                </a>
              </li>
            </ul>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-stone-500">
              Clinic hours
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-stone-600">
              {site.hours.map((h) => (
                <li key={`${h.days}-${h.time}`}>
                  <span className="font-medium text-stone-700">{h.days}:</span>{" "}
                  {h.time}
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-stone-500">
              Address
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              {site.address.line1}
              <br />
              {site.address.line2}
            </p>
          </div>

          <iframe
            title="Clinic location map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(site.address.mapsQuery)}&output=embed`}
            className="h-64 w-full rounded-2xl border border-stone-200"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
