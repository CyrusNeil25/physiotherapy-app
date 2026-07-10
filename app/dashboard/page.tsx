import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/site";

export const metadata: Metadata = { title: "My dashboard" };

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-teal-50 text-teal-700 border-teal-200",
  completed: "bg-stone-100 text-stone-600 border-stone-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  no_show: "bg-red-50 text-red-600 border-red-200",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, starts_at, mode, status, services(name, price_inr)")
    .order("starts_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            My dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500">{user?.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900">My bookings</h2>
        <Link
          href="/book"
          className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          + New booking
        </Link>
      </div>

      {!bookings || bookings.length === 0 ? (
        <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-600">
          No bookings yet.{" "}
          <Link href="/book" className="font-semibold text-teal-700">
            Book your first appointment
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {bookings.map((b) => {
            const svc = Array.isArray(b.services) ? b.services[0] : b.services;
            return (
              <li
                key={b.id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-stone-900">{svc?.name}</p>
                  <p className="text-sm text-stone-500">
                    {new Date(b.starts_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Kolkata",
                    })}{" "}
                    · {svc ? formatInr(svc.price_inr) : ""}
                  </p>
                </div>
                <span
                  className={`inline-block w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[b.status] ?? ""}`}
                >
                  {b.status.replace("_", " ")}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
