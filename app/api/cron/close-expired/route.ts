import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Closes consultations whose window has ended. Wired to Vercel Cron
 * (vercel.json, daily) — Vercel sends "Authorization: Bearer <CRON_SECRET>"
 * automatically when the CRON_SECRET env var is set on the project.
 * Trigger locally: curl -H "Authorization: Bearer $CRON_SECRET" .../api/cron/close-expired
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("consultations")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .in("status", ["active", "answered"])
    .lt("expires_at", new Date().toISOString())
    .select("id");

  if (error) {
    console.error("[cron/close-expired]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, closed: data?.length ?? 0 });
}
