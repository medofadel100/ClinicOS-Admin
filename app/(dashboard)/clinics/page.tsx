import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createClinic } from "./actions";
import { redirect } from "next/navigation";

export default async function ClinicsPage() {
  const supabase = createClient();
  
  const [{ data: clinics }, { data: types }, { data: plans }] = await Promise.all([
    supabase.from("clinics").select("*, clinic_types(name_en)").order("created_at", { ascending: false }),
    supabase.from("clinic_types").select("id, name_en").eq("is_active", true),
    supabase.from("plans").select("id, name_en, price_egp").eq("is_active", true).order("price_egp", { ascending: true })
  ]);

  async function handleCreateClinic(formData: FormData) {
    "use server";
    const result = await createClinic(formData);
    if (result.error) {
      // Basic error handling for MVP, ideally use form state
      console.error(result.error);
    } else if (result.clinicId) {
      redirect(`/clinics/${result.clinicId}`);
    }
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Clinics</h1>
        <p className="text-slate-600">Manage customer accounts and subscriptions.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Register New Clinic</h2>
        <form action={handleCreateClinic} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Clinic Name</label>
            <input name="name" required placeholder="Care Clinic" className="border border-slate-300 rounded-md px-3 py-2 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Clinic Type</label>
            <select name="clinic_type_id" required className="border border-slate-300 rounded-md px-3 py-2 outline-none bg-white">
              <option value="">Select a type...</option>
              {types?.map((t) => (
                <option key={t.id} value={t.id}>{t.name_en}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Owner Full Name</label>
            <input name="owner_full_name" required placeholder="Dr. Ahmed" className="border border-slate-300 rounded-md px-3 py-2 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Owner Email</label>
            <input name="owner_email" type="email" required placeholder="ahmed@example.com" className="border border-slate-300 rounded-md px-3 py-2 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Owner Phone</label>
            <input name="owner_phone" required placeholder="01000000000" className="border border-slate-300 rounded-md px-3 py-2 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Initial Status</label>
            <select name="status" required className="border border-slate-300 rounded-md px-3 py-2 outline-none bg-white">
              <option value="trial">Trial (7 Days)</option>
              <option value="active">Active (Paid)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Subscription Plan</label>
            <select name="plan_id" required className="border border-slate-300 rounded-md px-3 py-2 outline-none bg-white">
              <option value="">Select a plan...</option>
              {plans?.map((p) => (
                <option key={p.id} value={p.id}>{p.name_en} - {p.price_egp} EGP</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Discount Code</label>
            <input name="discount_code" placeholder="Optional (e.g. WELCOME20)" className="border border-slate-300 rounded-md px-3 py-2 outline-none uppercase" />
          </div>
          <div className="md:col-span-2 lg:col-span-3 mt-2">
            <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800">
              Create Clinic
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">Name</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Type</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Owner</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-3 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clinics?.map((clinic) => (
              <tr key={clinic.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{clinic.name}</td>
                <td className="px-6 py-4 text-slate-600">{clinic.clinic_types?.name_en}</td>
                <td className="px-6 py-4 text-slate-600">
                  <div>{clinic.owner_full_name}</div>
                  <div className="text-xs text-slate-400">{clinic.owner_email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    clinic.status === 'active' ? 'bg-green-100 text-green-700' : 
                    clinic.status === 'trial' ? 'bg-blue-100 text-blue-700' : 
                    clinic.status === 'past_due' ? 'bg-orange-100 text-orange-700' : 
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {clinic.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/clinics/${clinic.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                    View &rarr;
                  </Link>
                </td>
              </tr>
            ))}
            {!clinics?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No clinics found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
