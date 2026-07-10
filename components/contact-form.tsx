"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center">
        <p className="text-base font-semibold text-teal-800">
          Message sent — thank you!
        </p>
        <p className="mt-1 text-sm text-teal-700">
          You&apos;ll get a reply within one working day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Honeypot — bots fill it, humans never see it */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Name</span>
          <input
            required
            name="name"
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Phone</span>
          <input
            required
            name="phone"
            type="tel"
            autoComplete="tel"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            placeholder="+91 ..."
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">
          Email <span className="font-normal text-stone-400">(optional)</span>
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">
          How can we help?
        </span>
        <textarea
          required
          name="message"
          rows={4}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          placeholder="Briefly describe your problem or question. Please don't include sensitive medical details here — those can be shared privately later."
        />
      </label>

      {status === "error" && (
        <p className="text-sm text-red-600">
          Something went wrong. Please try again, or reach us on WhatsApp.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
