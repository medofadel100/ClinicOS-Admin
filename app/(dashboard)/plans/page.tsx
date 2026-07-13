import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function PlansPage() {
  const supabase = createClient();
  
  const { data: plans } = await supabase
    .from("plans")
    .select("*, plan_limits(*), plan_features(*)")
    .order("price_egp", { ascending: true });

  // A basic server action to create a manual plan (minimal)
  async function addPlan(formData: FormData) {
    "use server";
    const code = formData.get("code") as string;
    const name_ar = formData.get("name_ar") as string;
    const name_en = formData.get("name_en") as string;
    const price_egp = parseFloat(formData.get("price_egp") as string);
    const billing_cycle = formData.get("billing_cycle") as "monthly" | "yearly";
    
    if (!code || !name_ar || !name_en || isNaN(price_egp)) return;

    const supabase = createClient();
    await supabase.from("plans").insert({
      code,
      name_ar,
      name_en,
      price_egp,
      billing_cycle,
      is_active: true,
    });
    
    revalidatePath("/plans");
  }

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
          <div key={plan.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
            {!plan.is_active && (
              <div className="absolute top-0 right-0 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
                Disabled
              </div>
            )}
            <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name_en} / {plan.name_ar}</h3>
            <div className="font-mono text-sm text-slate-500 mb-4">{plan.code}</div>
            
            <div className="text-3xl font-bold mb-4">
              {plan.price_egp} <span className="text-lg font-normal text-slate-500">EGP / {plan.billing_cycle}</span>
            </div>

            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 mb-2 border-b pb-1">Limits</h4>
              <ul className="text-sm text-slate-600 flex flex-col gap-1 mb-4">
                {plan.plan_limits.map((limit) => (
                  <li key={limit.id} className="flex justify-between">
                    <span className="capitalize">{limit.limit_type.replace('_', ' ')}:</span>
                    <span className="font-medium text-slate-900">{limit.max_value === null ? 'Unlimited' : limit.max_value}</span>
                  </li>
                ))}
                {plan.plan_limits.length === 0 && <li className="italic">No limits defined</li>}
              </ul>

              <h4 className="font-semibold text-slate-800 mb-2 border-b pb-1">Features (Count)</h4>
              <div className="text-sm text-slate-600">
                {plan.plan_features.length} features assigned
              </div>
            </div>
          </div>
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
