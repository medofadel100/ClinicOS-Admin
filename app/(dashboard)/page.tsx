import { createClient } from "@/lib/supabase/server";
import DashboardHomeClient from "./_components/dashboard-home-client";

export default async function DashboardHomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: admin },
    { count: totalClinics },
    { count: activeClinics },
    { count: activeSubscriptions },
    { data: recentClinics },
    { data: recentPayments },
    { data: allConfirmedPayments },
    { data: expiringSubscriptions },
    { data: pastDueClinics }
  ] = await Promise.all([
    supabase.from("platform_admins").select("full_name, role").eq("auth_user_id", user.id).single(),
    supabase.from("clinics").select("*", { count: "exact", head: true }),
    supabase.from("clinics").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("clinic_subscriptions").select("*", { count: "exact", head: true }).in("status", ["active", "trial"]),
    supabase.from("clinics").select("id, name, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("payments").select("id, amount_egp, status, paid_at, clinics(name)").order("paid_at", { ascending: false }).limit(5),
    supabase.from("payments").select("amount_egp").eq("status", "confirmed"),
    supabase
      .from("clinic_subscriptions")
      .select("id, clinic_id, status, trial_ends_at, current_period_end, pending_confirmation_expires_at, clinics(name, owner_email)")
      .in("status", ["active", "trial", "pending_confirmation"])
      .or(`trial_ends_at.lte.${nextWeek},current_period_end.lte.${nextWeek},pending_confirmation_expires_at.lte.${nextWeek}`)
      .order("current_period_end", { ascending: true }),
    supabase
      .from("clinics")
      .select("id, name, owner_email, status, created_at")
      .eq("status", "past_due")
  ]);

  const totalRevenue = allConfirmedPayments?.reduce((sum, p) => sum + Number(p.amount_egp), 0) || 0;

  return (
    <DashboardHomeClient
      admin={admin}
      totalClinics={totalClinics ?? 0}
      activeClinics={activeClinics ?? 0}
      activeSubscriptions={activeSubscriptions ?? 0}
      totalRevenue={totalRevenue}
      recentClinics={recentClinics ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentPayments={(recentPayments ?? []) as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiringSubscriptions={(expiringSubscriptions ?? []) as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pastDueClinics={(pastDueClinics ?? []) as any}
    />
  );
}
