import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-stone-900">{site.name}</p>
          <p className="mt-1 text-sm text-stone-600">
            {site.doctor.name} · {site.doctor.credentials}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {site.doctor.registrationNumber}
          </p>
          <p className="mt-4 text-sm text-stone-600">
            {site.address.line1}
            <br />
            {site.address.line2}
          </p>
          <p className="mt-2 text-sm text-stone-600">{site.phone}</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Clinic hours
          </p>
          <ul className="mt-3 space-y-1 text-sm text-stone-600">
            {site.hours.map((h) => (
              <li key={`${h.days}-${h.time}`}>
                <span className="font-medium text-stone-700">{h.days}:</span>{" "}
                {h.time}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Links
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-1 text-sm">
            {[
              { href: "/about", label: "About" },
              { href: "/services", label: "Services" },
              { href: "/faq", label: "FAQ" },
              { href: "/contact", label: "Contact" },
              { href: "/disclaimer", label: "Medical disclaimer" },
              { href: "/privacy-policy", label: "Privacy policy" },
              { href: "/refund-policy", label: "Refund policy" },
              { href: "/terms", label: "Terms of use" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-stone-600 transition-colors hover:text-teal-700"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-200 py-4">
        <p className="mx-auto max-w-6xl px-4 text-xs text-stone-500 sm:px-6">
          © {new Date().getFullYear()} {site.name}. Online guidance does not
          replace an in-person medical examination. In an emergency, call your
          local emergency number or visit the nearest hospital.
        </p>
      </div>
    </footer>
  );
}
