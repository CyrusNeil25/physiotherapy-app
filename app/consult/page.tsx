import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ConsultForm } from "@/components/consult-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Online consultation",
  description: `Start a paid online consultation with ${site.doctor.name}.`,
};

export default async function ConsultPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, name, price_inr")
    .eq("mode", "chat")
    .eq("active", true)
    .order("sort");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-stone-900">
        Ask {site.doctor.shortName} online
      </h1>
      <p className="mt-3 text-lg text-stone-600">
        Describe your problem, pay securely, and get her professional guidance
        in a private chat. {site.replyPromise}.
      </p>

      <div className="mt-10">
        {services && services.length > 0 ? (
          <ConsultForm services={services} />
        ) : (
          <p className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-stone-600">
            Online consultations aren&apos;t available right now — the chat
            services haven&apos;t been set up yet (run migration
            0003_consultations.sql).
          </p>
        )}
      </div>
    </div>
  );
}
