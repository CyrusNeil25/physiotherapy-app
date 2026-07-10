import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking-flow";

export const metadata: Metadata = {
  title: "Book an appointment",
  description: "Book a clinic or home-visit physiotherapy appointment.",
};

export default async function BookPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, slug, name, mode, price_inr, duration_min")
    .eq("active", true)
    .order("sort");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-stone-900">
        Book an appointment
      </h1>
      <p className="mt-3 text-lg text-stone-600">
        Pick a service, then a free slot. You&apos;ll get an email once
        it&apos;s confirmed.
      </p>

      <div className="mt-10">
        <BookingFlow services={services ?? []} />
      </div>
    </div>
  );
}
