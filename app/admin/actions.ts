"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Not authorized");

  return supabase;
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "completed" | "no_show"
) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
  if (error) throw error;
  revalidatePath("/admin");
}

export async function setChatAvailability(available: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("clinic_settings")
    .update({ chat_available: available })
    .eq("id", true);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/consult");
}
