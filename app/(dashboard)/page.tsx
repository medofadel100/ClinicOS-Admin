import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { AlertCircle, Clock } from "lucide-react";

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
      .select("id, clinic_id, status, trial_ends_at, current_period_end, clinics(name, owner_email)")
      .in("status", ["active", "trial"])
      .or(`trial_ends_at.lte.${nextWeek},current_period_end.lte.${nextWeek}`)
      .order("current_period_end", { ascending: true }),
    supabase
      .from("clinics")
      .select("id, name, owner_email, status, created_at")
      .eq("status", "past_due")
  ]);

  const totalRevenue = allConfirmedPayments?.reduce((sum, p) => sum + Number(p.amount_egp), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Overview</h1>
          <p className="text-slate-600">Welcome back, {admin?.full_name}. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200">
          Role: <span className="capitalize">{admin?.role.replace("_", " ")}</span>
        </div>
      </div>

      {/* Alerts Section */}
      {(expiringSubscriptions?.length || pastDueClinics?.length) ? (
        <div className="flex flex-col gap-4">
          {pastDueClinics && pastDueClinics.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold">Past Due Clinics</h3>
              </div>
              <ul className="text-sm text-red-900 space-y-1">
                {pastDueClinics.map(c => (
                  <li key={c.id}>
                    <Link href={`/clinics/${c.id}`} className="hover:underline font-medium">{c.name}</Link>
                    {' '}({c.owner_email}) is past due.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {expiringSubscriptions && expiringSubscriptions.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                <Clock className="w-5 h-5" />
                <h3 className="font-bold">Expiring Within 7 Days</h3>
              </div>
              <ul className="text-sm text-amber-900 space-y-1">
                {expiringSubscriptions.map(sub => {
                  const dateToUse = sub.status === 'trial' ? sub.trial_ends_at : sub.current_period_end;
                  const dateStr = dateToUse ? new Date(dateToUse).toLocaleDateString() : 'Unknown';
                  return (
                    <li key={sub.id}>
                      <Link href={`/clinics/${sub.clinic_id}`} className="hover:underline font-medium">
                        {(sub.clinics as unknown as { name: string; owner_email: string })?.name}
                      </Link>
                      {' '}({(sub.clinics as unknown as { name: string; owner_email: string })?.owner_email}) - {sub.status === 'trial' ? 'Trial' : 'Subscription'} ends on {dateStr}.
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Clinics</h3>
          <div className="text-3xl font-bold">{totalClinics || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Active Clinics</h3>
          <div className="text-3xl font-bold text-green-600">{activeClinics || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Active Subscriptions</h3>
          <div className="text-3xl font-bold text-indigo-600">{activeSubscriptions || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Revenue</h3>
          <div className="text-3xl font-bold text-slate-900">{totalRevenue.toLocaleString()} EGP</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Clinics */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold">Recent Clinics</h2>
            <Link href="/clinics" className="text-sm text-indigo-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentClinics?.map(clinic => (
              <div key={clinic.id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <Link href={`/clinics/${clinic.id}`} className="font-medium text-slate-900 hover:underline block">
                    {clinic.name}
                  </Link>
                  <div className="text-xs text-slate-500 mt-1">Joined {new Date(clinic.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  clinic.status === 'active' ? 'bg-green-100 text-green-700' : 
                  clinic.status === 'trial' ? 'bg-blue-100 text-blue-700' : 
                  'bg-slate-100 text-slate-700'
                }`}>
                  {clinic.status.toUpperCase()}
                </span>
              </div>
            ))}
            {!recentClinics?.length && (
              <div className="p-8 text-center text-slate-500 text-sm">No clinics registered yet.</div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold">Recent Payments</h2>
            <Link href="/payments" className="text-sm text-indigo-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPayments?.map(payment => (
              <div key={payment.id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-medium text-slate-900">{payment.amount_egp} EGP</div>
                  <div className="text-xs text-slate-500 mt-1">{(payment.clinics as unknown as { name: string })?.name} • {new Date(payment.paid_at).toLocaleDateString()}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  payment.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                  payment.status === 'failed' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {payment.status.toUpperCase()}
                </span>
              </div>
            ))}
            {!recentPayments?.length && (
              <div className="p-8 text-center text-slate-500 text-sm">No payments recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
