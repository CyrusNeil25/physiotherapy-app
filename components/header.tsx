"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  // Client-side only: keeps marketing pages fully static (no per-request
  // Supabase round trip in the layout) while still reflecting auth state
  // once hydrated. getSession() reads local storage — no network call.
  useEffect(() => {
    // Supabase not connected yet (Phase 1 preview) — stay in signed-out state.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    const supabase = createClient();

    async function sync(userId: string | undefined) {
      setSignedIn(!!userId);
      if (!userId) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      setIsAdmin(data?.role === "admin");
    }

    supabase.auth.getSession().then(({ data }) => sync(data.session?.user.id));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => sync(session?.user.id));
    return () => subscription.unsubscribe();
  }, []);

  const accountHref = signedIn ? "/dashboard" : "/login";
  const accountLabel = signedIn ? "My dashboard" : "Sign in";

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-lg font-bold text-white">
            R
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold text-stone-900">
              {site.name}
            </span>
            <span className="block text-xs text-stone-500">
              {site.doctor.name}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-teal-700 ${
                pathname === l.href ? "text-teal-700" : "text-stone-600"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors hover:text-teal-700 ${
                pathname.startsWith("/admin") ? "text-teal-700" : "text-stone-600"
              }`}
            >
              Doctor admin
            </Link>
          )}
          <Link
            href={accountHref}
            className="text-sm font-medium text-stone-600 transition-colors hover:text-teal-700"
          >
            {accountLabel}
          </Link>
          <Link
            href="/consult"
            className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            Consult Online
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-md text-stone-700 md:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-stone-200 bg-white px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-md px-3 py-3 text-base font-medium ${
                pathname === l.href
                  ? "bg-teal-50 text-teal-700"
                  : "text-stone-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`block rounded-md px-3 py-3 text-base font-medium ${
                pathname.startsWith("/admin") ? "bg-teal-50 text-teal-700" : "text-stone-700"
              }`}
            >
              Doctor admin
            </Link>
          )}
          <Link
            href={accountHref}
            className="block rounded-md px-3 py-3 text-base font-medium text-stone-700"
          >
            {accountLabel}
          </Link>
          <Link
            href="/consult"
            className="mt-2 block rounded-full bg-teal-700 px-4 py-3 text-center text-base font-semibold text-white"
          >
            Consult Online
          </Link>
        </nav>
      )}
    </header>
  );
}
