"use client";

import { useState } from "react";
import { rateConsultation } from "@/app/consultation/actions";

export function RatingForm({ consultationId }: { consultationId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setStatus("saving");
    const result = await rateConsultation({ consultationId, rating, comment });
    if (result.ok) {
      setStatus("done");
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-5 text-center">
        <p className="font-semibold text-teal-800">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-stone-200 bg-white p-5">
      <p className="text-sm font-semibold text-stone-900">
        How was your consultation?
      </p>
      <div className="mt-3 flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            className={`text-3xl transition-transform hover:scale-110 ${
              n <= (hover || rating) ? "text-amber-400" : "text-stone-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      {rating > 0 && (
        <>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Anything you'd like to add? (optional)"
            className="mt-3 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
          {status === "error" && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={status === "saving"}
            className="mt-3 rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "Submit rating"}
          </button>
        </>
      )}
    </form>
  );
}
