"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatInr } from "@/lib/site";
import { createBooking } from "@/app/book/actions";
import type { Slot } from "@/lib/availability";

type Service = {
  id: string;
  slug: string;
  name: string;
  mode: "clinic" | "home_visit" | "chat";
  price_inr: number;
  duration_min: number;
};

const modeLabels: Record<string, string> = {
  clinic: "At the clinic",
  home_visit: "At your home",
};

function nextDays(count: number): { iso: string; label: string }[] {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    days.push({ iso, label });
  }
  return days;
}

export function BookingFlow({ services }: { services: Service[] }) {
  const router = useRouter();
  const bookable = useMemo(() => services.filter((s) => s.mode !== "chat"), [services]);
  const days = useMemo(() => nextDays(14), []);

  const [serviceId, setServiceId] = useState(bookable[0]?.id ?? "");
  const [date, setDate] = useState(days[0]?.iso ?? "");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "booking" | "error" | "done">("idle");
  const [error, setError] = useState("");

  const service = bookable.find((s) => s.id === serviceId);

  useEffect(() => {
    if (!serviceId || !date) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(`/api/availability?date=${date}&service_id=${serviceId}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [serviceId, date]);

  async function confirm() {
    if (!service || !selectedSlot) return;
    setStatus("booking");
    setError("");

    const result = await createBooking({
      serviceId: service.id,
      serviceName: service.name,
      startsAt: selectedSlot.startsAt,
      endsAt: selectedSlot.endsAt,
      mode: service.mode as "clinic" | "home_visit",
      patientNote: note,
    });

    if (result.ok) {
      setStatus("done");
    } else {
      setError(result.error);
      setStatus("error");
      // Slot may already be taken — refresh the list
      fetch(`/api/availability?date=${date}&service_id=${serviceId}`)
        .then((r) => r.json())
        .then((data) => setSlots(data.slots ?? []));
    }
  }

  if (bookable.length === 0) {
    return (
      <p className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-stone-600">
        No bookable services are configured yet.
      </p>
    );
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-6">
        <p className="text-base font-semibold text-teal-800">
          Appointment requested!
        </p>
        <p className="mt-1 text-sm text-teal-700">
          We&apos;ve emailed you a confirmation. You can see this booking any
          time from your dashboard.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Go to my dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Service */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          1. Service
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {bookable.map((s) => (
            <button
              key={s.id}
              onClick={() => setServiceId(s.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                s.id === serviceId
                  ? "border-teal-600 bg-teal-50"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                {modeLabels[s.mode]}
              </p>
              <p className="mt-1 font-semibold text-stone-900">{s.name}</p>
              <p className="mt-1 text-sm text-stone-600">
                {formatInr(s.price_inr)} · {s.duration_min} min
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          2. Date
        </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {days.map((d) => (
            <button
              key={d.iso}
              onClick={() => setDate(d.iso)}
              className={`shrink-0 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                d.iso === date
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-stone-200 text-stone-700 hover:border-stone-300"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slots */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          3. Time
        </p>
        {loadingSlots ? (
          <p className="mt-3 text-sm text-stone-500">Loading available times…</p>
        ) : slots.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No slots on this day — try another date.</p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const time = new Date(slot.startsAt).toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                timeZone: "Asia/Kolkata",
              });
              const isSelected = selectedSlot?.startsAt === slot.startsAt;
              return (
                <button
                  key={slot.startsAt}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    !slot.available
                      ? "cursor-not-allowed border-stone-100 text-stone-300 line-through"
                      : isSelected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-stone-200 text-stone-700 hover:border-stone-300"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm */}
      {selectedSlot && (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">
              Anything you&apos;d like to mention?{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              placeholder="E.g. first visit, follow-up, specific concern"
            />
          </label>

          {status === "error" && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={confirm}
            disabled={status === "booking"}
            className="mt-4 w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-60 sm:w-auto"
          >
            {status === "booking" ? "Booking…" : "Confirm appointment"}
          </button>
        </div>
      )}
    </div>
  );
}
