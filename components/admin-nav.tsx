"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChatAvailabilityToggle } from "@/components/chat-availability-toggle";

const baseTabs = [
  { href: "/admin", label: "Today" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/earnings", label: "Earnings" },
];

export function AdminNav({
  initialWaitingCount,
  chatAvailable,
}: {
  initialWaitingCount: number;
  chatAvailable: boolean;
}) {
  const pathname = usePathname();
  const [waiting, setWaiting] = useState(initialWaitingCount);

  // AdminNav persists across client-side navigations within /admin/* (it's
  // part of the shared layout, not remounted per page) — so a fresh
  // server-computed count arriving via props on each navigation must be
  // explicitly synced; useState's initializer only applies on first mount.
  useEffect(() => {
    setWaiting(initialWaitingCount);
  }, [initialWaitingCount]);

  useEffect(() => {
    const supabase = createClient();

    async function refetchCount() {
      const { count } = await supabase
        .from("consultations")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      setWaiting(count ?? 0);
    }

    // UPDATE covers it entirely: a new paid consultation transitions into
    // 'active' via UPDATE (never created with that status directly), a
    // patient's follow-up message flips it back to 'active', and the
    // doctor's reply flips it to 'answered' — every case that should move
    // this counter is a status UPDATE on consultations.
    const channel = supabase
      .channel("admin-waiting-consultations")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "consultations" },
        refetchCount
      )
      .subscribe();

    // Safety net: if Realtime is ever misconfigured or a socket drops
    // silently, this guarantees the badge self-corrects within 20s instead
    // of staying wrong indefinitely.
    const interval = setInterval(refetchCount, 20_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Ambient signal even when she's on another browser tab
  useEffect(() => {
    document.title =
      waiting > 0
        ? `(${waiting}) Restore Physiotherapy — Admin`
        : "Restore Physiotherapy — Admin";
  }, [waiting]);

  return (
    <div className="mb-8 border-b border-stone-200 pb-3">
      {/* Tabs get their own row, scrollable if they ever overflow narrow
          screens, so they never compete for space with the actions below. */}
      <div className="flex gap-1 overflow-x-auto sm:gap-2">
        {baseTabs.map((t) => {
          const active =
            t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4 ${
                active
                  ? "border-teal-700 text-teal-700"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {t.label}
              {t.href === "/admin/inbox" && waiting > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-xs font-bold text-white">
                  {waiting}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Always a full-width row of its own — on narrow screens this keeps
          the toggle and sign-out cleanly apart instead of getting squeezed
          together on the right when the tabs row above wraps. */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <ChatAvailabilityToggle initial={chatAvailable} />
        <form action="/auth/signout?next=/admin/login" method="post">
          <button className="rounded-full border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-800">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
