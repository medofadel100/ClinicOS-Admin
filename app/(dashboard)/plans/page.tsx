import { createClient } from "@/lib/supabase/server";
import { addPlan } from "./actions";
import { PlanCard } from "./_components/plan-card";

export default async function PlansPage() {
  const supabase = createClient();
  
  const { data: plans } = await supabase
    .from("plans")
    .select("*, plan_limits(*), plan_features(*)")
    .order("price_egp", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Subscription Plans</h1>
          <p className="text-slate-600">Manage pricing tiers and their configurations.</p>
        </div>
        <form action="/plans/seed" method="POST">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
            Seed Initial Data
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-4xl">
        <h2 className="text-lg font-semibold mb-4">Add New Plan</h2>
        <form action={addPlan} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Code (Unique)</label>
            <input name="code" required placeholder="e.g. basic" className="border border-slate-300 rounded-md px-3 py-2 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name (English)</label>
            <input name="name_en" required placeholder="Basic" className="border border-slate-300 rounded-md px-3 py-2 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name (Arabic)</label>
            <input name="name_ar" required placeholder="الأساسية" className="border border-slate-300 rounded-md px-3 py-2 outline-none text-right" dir="rtl" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Price (EGP)</label>
            <input name="price_egp" type="number" required placeholder="0.00" step="0.01" className="border border-slate-300 rounded-md px-3 py-2 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Billing Cycle</label>
            <select name="billing_cycle" required className="border border-slate-300 rounded-md px-3 py-2 outline-none bg-white">
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="md:col-span-3 mt-2">
            <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800">
              Add Plan
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
        {!plans?.length && (
          <div className="col-span-full bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No plans found. Use the &quot;Seed Initial Data&quot; button to populate standard plans.
          </div>
        )}
      </div>
    </div>
  );
}
