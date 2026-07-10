import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin — Inbox" };

const statusStyles: Record<string, string> = {
  awaiting_payment: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-teal-50 text-teal-700 border-teal-200",
  answered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-stone-100 text-stone-600 border-stone-200",
  refunded: "bg-red-50 text-red-600 border-red-200",
};

const statusLabels: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  active: "Needs your reply",
  answered: "You replied",
  closed: "Closed",
  refunded: "Refunded",
};

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function AdminInboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: consultations }, { data: unreadRows }] = await Promise.all([
    supabase
      .from("consultations")
      .select("id, status, created_at, opened_at, profiles(full_name), services(name)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("messages")
      .select("consultation_id, sender_id")
      .is("read_at", null),
  ]);

  const unreadByConsultation = new Map<string, number>();
  for (const m of unreadRows ?? []) {
    if (m.sender_id === user?.id) continue; // own messages don't count
    unreadByConsultation.set(
      m.consultation_id,
      (unreadByConsultation.get(m.consultation_id) ?? 0) + 1
    );
  }

  const rows = consultations ?? [];
  // Needs-reply first, then pending payments, then the rest
  const weight: Record<string, number> = {
    active: 0,
    awaiting_payment: 1,
    answered: 2,
    closed: 3,
    refunded: 3,
  };
  rows.sort((a, b) => (weight[a.status] ?? 9) - (weight[b.status] ?? 9));

  const waiting = rows.filter((r) => r.status === "active").length;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Consultation inbox
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        {waiting === 0
          ? "No consultations waiting for a reply."
          : `${waiting} consultation${waiting === 1 ? "" : "s"} waiting for your reply.`}
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-500">
          No online consultations yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((c) => {
            const patient = one(c.profiles);
            const service = one(c.services);
            const unread = unreadByConsultation.get(c.id) ?? 0;
            return (
              <li key={c.id}>
                <Link
                  href={`/consultation/${c.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-stone-900">
                      {patient?.full_name || "Unnamed patient"}
                      {unread > 0 && (
                        <span className="rounded-full bg-teal-600 px-2 py-0.5 text-xs font-bold text-white">
                          {unread} new
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-stone-500">
                      {service?.name} ·{" "}
                      {new Date(c.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[c.status] ?? ""}`}
                  >
                    {statusLabels[c.status] ?? c.status}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
