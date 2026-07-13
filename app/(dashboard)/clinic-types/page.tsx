import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function ClinicTypesPage() {
  const supabase = createClient();
  
  const { data: clinicTypes } = await supabase
    .from("clinic_types")
    .select("*")
    .order("created_at", { ascending: false });

  async function addClinicType(formData: FormData) {
    "use server";
    const code = formData.get("code") as string;
    const name_ar = formData.get("name_ar") as string;
    const name_en = formData.get("name_en") as string;
    const description = formData.get("description") as string;
    
    if (!code || !name_ar || !name_en) return;

    const supabase = createClient();
    await supabase.from("clinic_types").insert({
      code,
      name_ar,
      name_en,
      description: description || null,
      is_active: true,
    });
    
    revalidatePath("/clinic-types");
  }

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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clinicTypes?.map((type) => (
              <tr key={type.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-slate-700">{type.code}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{type.name_en}</td>
                <td className="px-6 py-4 text-slate-600">{type.name_ar}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {type.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
              </tr>
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
