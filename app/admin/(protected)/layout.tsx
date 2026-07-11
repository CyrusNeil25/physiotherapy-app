import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  // "Needs my reply" — flips to 'active' both when a brand-new consultation
  // is paid for (no messages exist yet, so a messages-table count would miss
  // it entirely) and when a patient sends a follow-up in an existing thread;
  // flips away the moment the doctor actually replies. One signal covers both.
  const [{ count: waitingCount }, { data: settings }] = await Promise.all([
    supabase
      .from("consultations")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("clinic_settings").select("chat_available").eq("id", true).single(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <AdminNav
        initialWaitingCount={waitingCount ?? 0}
        chatAvailable={settings?.chat_available ?? true}
      />
      {children}
    </div>
  );
}
