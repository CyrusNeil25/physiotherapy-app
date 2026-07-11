import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateChatSlots } from "@/lib/chat-schedule";

/** Public — availability_rules/exceptions are public-readable by RLS. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date (YYYY-MM-DD) is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const [rulesRes, exceptionRes] = await Promise.all([
    supabase.from("availability_rules").select("weekday, start_time, end_time"),
    supabase.from("availability_exceptions").select("closed").eq("date", date).maybeSingle(),
  ]);

  const slots = generateChatSlots({
    date,
    rules: rulesRes.data ?? [],
    isClosed: exceptionRes.data?.closed ?? false,
  });

  return NextResponse.json({ slots });
}
