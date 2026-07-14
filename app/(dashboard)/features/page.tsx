import { createClient } from "@/lib/supabase/server";
import { addFeature } from "./actions";
import { FeatureRow } from "./_components/feature-row";

export default async function FeaturesPage() {
  const supabase = createClient();
  
  const { data: features } = await supabase
    .from("features")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Feature Catalog</h1>
        <p className="text-slate-600">Manage available features and their base pricing.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New Feature</h2>
        <form action={addFeature} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Code (Unique)</label>
            <input 
              name="code" 
              required 
              placeholder="e.g. offline_desktop_app"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Category</label>
            <input 
              name="category" 
              required 
              placeholder="e.g. core, automation"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name (English)</label>
            <input 
              name="name_en" 
              required 
              placeholder="Offline App"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name (Arabic)</label>
            <input 
              name="name_ar" 
              required 
              placeholder="تطبيق أوفلاين"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 text-right"
              dir="rtl"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Base Price (EGP) - Optional</label>
            <input 
              name="base_price_egp" 
              type="number"
              step="0.01"
              placeholder="0.00"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="md:col-span-2 mt-2">
            <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800">
              Add Feature
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">Code</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Name (EN)</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Category</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Base Price</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-3 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {features?.map((feature) => (
              <FeatureRow key={feature.id} feature={feature} />
            ))}
            {!features?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No features found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
