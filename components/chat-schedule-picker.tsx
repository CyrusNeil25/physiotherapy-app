"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatSlot } from "@/lib/chat-schedule";

function nextDays(count: number): { iso: string; label: string }[] {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    days.push({ iso, label });
  }
  return days;
}

export function ChatSchedulePicker({
  onChange,
  onModeChange,
}: {
  /** null = chat as soon as possible (async, no fixed time) */
  onChange: (scheduledAt: string | null) => void;
  /** Fires when the user switches between "as soon as possible" and "schedule" */
  onModeChange?: (scheduling: boolean) => void;
}) {
  const days = useMemo(() => nextDays(14), []);
  const [scheduling, setScheduling] = useState(false);
  const [date, setDate] = useState(days[0]?.iso ?? "");
  const [slots, setSlots] = useState<ChatSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!scheduling || !date) return;
    setLoading(true);
    setSelected(null);
    onChange(null);
    fetch(`/api/chat-schedule?date=${date}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduling, date]);

  function toggle(next: boolean) {
    setScheduling(next);
    setSelected(null);
    onChange(null);
    onModeChange?.(next);
  }

  function pick(startsAt: string) {
    setSelected(startsAt);
    onChange(startsAt);
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
        When would you like to chat?
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => toggle(false)}
          className={`rounded-xl border p-4 text-left transition-colors ${
            !scheduling ? "border-teal-600 bg-teal-50" : "border-stone-200 hover:border-stone-300"
          }`}
        >
          <p className="font-semibold text-stone-900">As soon as possible</p>
          <p className="mt-1 text-sm text-stone-600">
            Message anytime — she&apos;ll reply within her usual window.
          </p>
        </button>
        <button
          type="button"
          onClick={() => toggle(true)}
          className={`rounded-xl border p-4 text-left transition-colors ${
            scheduling ? "border-teal-600 bg-teal-50" : "border-stone-200 hover:border-stone-300"
          }`}
        >
          <p className="font-semibold text-stone-900">Schedule a specific time</p>
          <p className="mt-1 text-sm text-stone-600">
            Pick a time she&apos;ll be online to chat with you live.
          </p>
        </button>
      </div>

      {scheduling && (
        <div className="mt-4 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => (
              <button
                key={d.iso}
                type="button"
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

          {loading ? (
            <p className="text-sm text-stone-500">Loading available times…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-stone-500">No times on this day — try another date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const time = new Date(slot.startsAt).toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                });
                const isSelected = selected === slot.startsAt;
                return (
                  <button
                    key={slot.startsAt}
                    type="button"
                    onClick={() => pick(slot.startsAt)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      isSelected
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
      )}
    </div>
  );
}
