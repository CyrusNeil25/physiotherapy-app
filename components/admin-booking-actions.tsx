"use client";

import { useTransition } from "react";
import { updateBookingStatus } from "@/app/admin/actions";

export function AdminBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  function set(next: "confirmed" | "cancelled" | "completed" | "no_show") {
    startTransition(() => updateBookingStatus(bookingId, next));
  }

  if (status === "cancelled" || status === "completed" || status === "no_show") {
    return null;
  }

  return (
    <div className="flex gap-2">
      {status === "pending" && (
        <button
          disabled={isPending}
          onClick={() => set("confirmed")}
          className="rounded-full bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          Confirm
        </button>
      )}
      {status === "confirmed" && (
        <button
          disabled={isPending}
          onClick={() => set("completed")}
          className="rounded-full bg-stone-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
        >
          Mark done
        </button>
      )}
      <button
        disabled={isPending}
        onClick={() => set("cancelled")}
        className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        Cancel
      </button>
    </div>
  );
}
