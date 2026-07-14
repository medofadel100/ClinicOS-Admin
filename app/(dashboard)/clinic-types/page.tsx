import { createClient } from "@/lib/supabase/server";
import { addClinicType } from "./actions";
import { ClinicTypeRow } from "./_components/clinic-type-row";

export default async function ClinicTypesPage() {
  const supabase = createClient();
  
  const { data: clinicTypes } = await supabase
    .from("clinic_types")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Clinic Types</h1>
        <p className="text-slate-600">Manage supported medical specialties.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New Type</h2>
        <form action={addClinicType} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Code (Unique)</label>
            <input 
              name="code" 
              required 
              placeholder="e.g. dental"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name (English)</label>
            <input 
              name="name_en" 
              required 
              placeholder="Dental Clinic"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name (Arabic)</label>
            <input 
              name="name_ar" 
              required 
              placeholder="عيادة أسنان"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 text-right"
              dir="rtl"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Description (Optional)</label>
            <input 
              name="description" 
              placeholder="Brief description..."
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="mt-2 bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800">
              Add Clinic Type
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
              <th className="px-6 py-3 font-semibold text-slate-700">Name (AR)</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-3 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clinicTypes?.map((type) => (
              <ClinicTypeRow key={type.id} type={type} />
            ))}
            {!clinicTypes?.length && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No clinic types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
