"use client";

import { useState, useTransition } from "react";
import { setChatAvailability } from "@/app/admin/actions";

export function ChatAvailabilityToggle({ initial }: { initial: boolean }) {
  const [available, setAvailable] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !available;
    setAvailable(next); // optimistic
    startTransition(async () => {
      try {
        await setChatAvailability(next);
      } catch {
        setAvailable(!next); // revert on failure
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={available}
      className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:border-stone-300 disabled:opacity-60"
      title={
        available
          ? "You're shown as available for live chat — click to go unavailable"
          : "You're shown as unavailable for live chat — click to go available"
      }
    >
      <span
        className={`h-2 w-2 rounded-full ${available ? "bg-emerald-500" : "bg-stone-400"}`}
      />
      {available ? "Available for chat" : "Unavailable for chat"}
    </button>
  );
}
