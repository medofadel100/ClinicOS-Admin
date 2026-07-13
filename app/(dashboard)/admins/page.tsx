import { createClient } from "@/lib/supabase/server";
import { createAdmin } from "./actions";

export default async function AdminsPage() {
  const supabase = createClient();
  
  // Fetch existing admins and join with auth.users to get email? 
  // RLS or privileges might not allow joining auth.users easily from standard client.
  // We'll just list platform_admins for now.
  const { data: admins } = await supabase
    .from("platform_admins")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Manage Admins</h1>
        <p className="text-slate-600">Add or view platform administrators and observers.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New Admin</h2>
        <form action={async (formData) => {
          "use server";
          await createAdmin(formData);
        }} className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              name="full_name" 
              required 
              placeholder="Admin Name"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Email Address</label>
            <input 
              name="email" 
              type="email"
              required 
              placeholder="admin@clinicos.com"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Password</label>
            <input 
              name="password" 
              type="password"
              required 
              placeholder="Secure password"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Role</label>
            <select 
              name="role" 
              required
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 bg-white"
            >
              <option value="super_admin">Super Admin (Full Access)</option>
              <option value="accountant">Accountant (Billing Only)</option>
              <option value="support">Support / Observer</option>
            </select>
          </div>
          <button type="submit" className="mt-2 bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800">
            Create Admin
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">Name</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Role</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins?.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{admin.full_name}</td>
                <td className="px-6 py-4 text-slate-600 capitalize">{admin.role.replace("_", " ")}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {admin.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
              </tr>
            ))}
            {!admins?.length && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
