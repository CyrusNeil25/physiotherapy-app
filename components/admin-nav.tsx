"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Today" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/earnings", label: "Earnings" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-8 flex items-center justify-between border-b border-stone-200">
      <div className="flex gap-2">
        {tabs.map((t) => {
          const active =
            t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "border-teal-700 text-teal-700"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      <form action="/auth/signout?next=/admin/login" method="post" className="pb-2">
        <button className="text-sm font-medium text-stone-500 hover:text-stone-800">
          Sign out
        </button>
      </form>
    </nav>
  );
}
