import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminBookingActions } from "@/components/admin-booking-actions";

export const metadata: Metadata = { title: "Admin — Today" };

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-teal-50 text-teal-700 border-teal-200",
  completed: "bg-stone-100 text-stone-600 border-stone-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  no_show: "bg-red-50 text-red-600 border-red-200",
};

export default async function AdminTodayPage() {
  const supabase = await createClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const in7Days = new Date(startOfToday);
  in7Days.setDate(in7Days.getDate() + 7);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, starts_at, mode, status, patient_note, profiles(full_name, phone), services(name)")
    .gte("starts_at", startOfToday.toISOString())
    .lt("starts_at", in7Days.toISOString())
    .order("starts_at");

  const today = new Date().toDateString();
  const todays = (bookings ?? []).filter((b) => new Date(b.starts_at).toDateString() === today);
  const upcoming = (bookings ?? []).filter((b) => new Date(b.starts_at).toDateString() !== today);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">Today</h1>

      <BookingList title={`Today — ${todays.length} booking${todays.length === 1 ? "" : "s"}`} bookings={todays} />
      <BookingList title="Next 7 days" bookings={upcoming} />
    </div>
  );
}

type Row = {
  id: string;
  starts_at: string;
  mode: string;
  status: string;
  patient_note: string | null;
  profiles: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null;
  services: { name: string } | { name: string }[] | null;
};

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function BookingList({ title, bookings }: { title: string; bookings: Row[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
        {title}
      </h2>
      {bookings.length === 0 ? (
        <p className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
          Nothing here.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {bookings.map((b) => {
            const patient = one(b.profiles);
            const service = one(b.services);
            return (
              <li
                key={b.id}
                className="rounded-xl border border-stone-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {new Date(b.starts_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {service?.name} · {b.mode === "clinic" ? "Clinic" : "Home visit"}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {patient?.full_name || "Unnamed patient"}
                      {patient?.phone ? ` · ${patient.phone}` : ""}
                    </p>
                    {b.patient_note && (
                      <p className="mt-2 text-sm italic text-stone-500">
                        &ldquo;{b.patient_note}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[b.status] ?? ""}`}
                    >
                      {b.status.replace("_", " ")}
                    </span>
                    <AdminBookingActions bookingId={b.id} status={b.status} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
