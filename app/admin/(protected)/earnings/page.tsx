import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/site";

export const metadata: Metadata = { title: "Admin — Earnings" };

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

/** "Jul 2026" in clinic time — used as the grouping key */
function monthKey(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export default async function AdminEarningsPage() {
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, amount_inr, status, provider, created_at, consultations(services(name), profiles(full_name))"
    )
    .in("status", ["paid", "refunded"])
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = payments ?? [];
  const paid = rows.filter((p) => p.status === "paid");

  const now = new Date();
  const thisMonth = monthKey(now);
  const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 15));

  const sum = (list: typeof paid) => list.reduce((acc, p) => acc + p.amount_inr, 0);
  const thisMonthTotal = sum(paid.filter((p) => monthKey(p.created_at) === thisMonth));
  const lastMonthTotal = sum(paid.filter((p) => monthKey(p.created_at) === lastMonth));
  const refundedTotal = sum(rows.filter((p) => p.status === "refunded") as typeof paid);

  const byService = new Map<string, { count: number; total: number }>();
  for (const p of paid) {
    const service = one(one(p.consultations)?.services ?? null);
    const name = service?.name ?? "Unknown";
    const entry = byService.get(name) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += p.amount_inr;
    byService.set(name, entry);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">Earnings</h1>
      <p className="mt-1 text-sm text-stone-500">
        Online consultation payments. Clinic visits paid in person aren&apos;t
        counted here.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: `This month (${thisMonth})`, value: formatInr(thisMonthTotal) },
          { label: `Last month (${lastMonth})`, value: formatInr(lastMonthTotal) },
          { label: "All time", value: formatInr(sum(paid)) },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-stone-900">{card.value}</p>
          </div>
        ))}
      </div>

      {refundedTotal > 0 && (
        <p className="mt-3 text-sm text-stone-500">
          Refunded to date: {formatInr(refundedTotal)}
        </p>
      )}

      {byService.size > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            By service
          </h2>
          <ul className="mt-3 space-y-2">
            {[...byService.entries()]
              .sort((a, b) => b[1].total - a[1].total)
              .map(([name, { count, total }]) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm"
                >
                  <span className="font-medium text-stone-800">
                    {name} <span className="text-stone-400">× {count}</span>
                  </span>
                  <span className="font-semibold text-stone-900">{formatInr(total)}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Recent payments
        </h2>
        {rows.length === 0 ? (
          <p className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-500">
            No payments yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rows.slice(0, 30).map((p) => {
              const consultation = one(p.consultations);
              const service = one(consultation?.services ?? null);
              const patient = one(consultation?.profiles ?? null);
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-stone-800">
                      {patient?.full_name || "Unnamed"} · {service?.name ?? "—"}
                    </p>
                    <p className="text-xs text-stone-500">
                      {new Date(p.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Kolkata",
                      })}{" "}
                      · {p.provider}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      p.status === "refunded"
                        ? "text-red-500 line-through"
                        : "text-stone-900"
                    }`}
                  >
                    {formatInr(p.amount_inr)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
