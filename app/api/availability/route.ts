import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateSlots } from "@/lib/availability";

/**
 * Returns bookable slots for a service on a date. Uses the admin (service-role)
 * client because computing "what's taken" requires seeing all patients'
 * bookings for the day — RLS otherwise limits each patient to their own rows.
 * Only start/end times are returned, never who booked them.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("service_id");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !serviceId) {
    return NextResponse.json(
      { error: "date (YYYY-MM-DD) and service_id are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const [serviceRes, rulesRes, exceptionRes, bookingsRes] = await Promise.all([
    supabase.from("services").select("duration_min").eq("id", serviceId).single(),
    supabase.from("availability_rules").select("weekday, start_time, end_time"),
    supabase.from("availability_exceptions").select("closed").eq("date", date).maybeSingle(),
    supabase
      .from("bookings")
      .select("starts_at, ends_at")
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", `${date}T00:00:00+05:30`)
      .lt("starts_at", `${date}T23:59:59+05:30`),
  ]);

  if (!serviceRes.data) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const slots = generateSlots({
    date,
    durationMin: serviceRes.data.duration_min,
    rules: rulesRes.data ?? [],
    isClosed: exceptionRes.data?.closed ?? false,
    bookedRanges: bookingsRes.data ?? [],
  });

  return NextResponse.json({ slots });
}
