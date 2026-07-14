import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { addPlanLimit, removePlanLimit, addPlanFeature, removePlanFeature } from "./actions";

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const [
    { data: plan },
    { data: allFeatures },
  ] = await Promise.all([
    supabase.from("plans").select("*, plan_limits(*), plan_features(*, features(*))").eq("id", params.id).single(),
    supabase.from("features").select("*").eq("is_active", true).order("name_en", { ascending: true })
  ]);

  if (!plan) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeFeatureIds = plan.plan_features.map((pf: any) => pf.feature_id);
  const unassignedFeatures = allFeatures?.filter(f => !activeFeatureIds.includes(f.id)) || [];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/plans" className="text-sm text-slate-500 hover:text-slate-900">&larr; Back to Plans</Link>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-1">{plan.name_en} / {plan.name_ar}</h1>
        <p className="text-slate-600">Manage limits and features for {plan.code}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h2 className="text-xl font-bold border-b pb-2">Plan Limits</h2>
          
          <ul className="flex flex-col gap-2">
            {plan.plan_limits.map((limit: {id: string, limit_type: string, max_value: number | null}) => (
              <li key={limit.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-100">
                <div>
                  <span className="capitalize font-medium block">{limit.limit_type.replace('_', ' ')}</span>
                  <span className="text-sm text-slate-600">{limit.max_value === null ? 'Unlimited' : limit.max_value}</span>
                </div>
                <form action={async () => { "use server"; await removePlanLimit(limit.id, plan.id); }}>
                  <button className="text-red-600 text-sm hover:underline">Remove</button>
                </form>
              </li>
            ))}
            {plan.plan_limits.length === 0 && <li className="text-sm text-slate-500 italic">No limits set.</li>}
          </ul>

          <form action={addPlanLimit} className="mt-4 border-t pt-4 flex flex-col gap-3">
            <input type="hidden" name="plan_id" value={plan.id} />
            <h3 className="text-sm font-semibold text-slate-700">Add or Update Limit</h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Limit Type</label>
              <select name="limit_type" required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm bg-white">
                <option value="provider_seats">Provider Seats</option>
                <option value="patients">Patients</option>
                <option value="staff_accounts">Staff Accounts</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Max Value (leave empty for unlimited)</label>
              <input type="number" name="max_value" className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm" />
            </div>
            <button type="submit" className="bg-slate-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-800 self-start mt-2">Save Limit</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h2 className="text-xl font-bold border-b pb-2">Bundled Features</h2>
          
          <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2">
            {plan.plan_features.map((pf: {feature_id: string, features: {name_en: string}}) => (
              <li key={pf.feature_id} className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-100">
                <span className="font-medium text-sm">{pf.features.name_en}</span>
                <form action={async () => { "use server"; await removePlanFeature(plan.id, pf.feature_id); }}>
                  <button className="text-red-600 text-sm hover:underline">Remove</button>
                </form>
              </li>
            ))}
            {plan.plan_features.length === 0 && <li className="text-sm text-slate-500 italic">No features assigned.</li>}
          </ul>

          <div className="mt-4 border-t pt-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-700">Assign New Feature</h3>
            {unassignedFeatures.length > 0 ? (
              <form action={async (formData) => {
                "use server";
                const featureId = formData.get("feature_id") as string;
                if(featureId) await addPlanFeature(plan.id, featureId);
              }} className="flex gap-2">
                <select name="feature_id" required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm bg-white flex-1">
                  <option value="">Select feature...</option>
                  {unassignedFeatures.map(f => (
                    <option key={f.id} value={f.id}>{f.name_en}</option>
                  ))}
                </select>
                <button type="submit" className="bg-slate-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-800">Add</button>
              </form>
            ) : (
              <div className="text-sm text-slate-500 italic">All active features are assigned.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
