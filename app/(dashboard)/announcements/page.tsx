import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AnnouncementsPage() {
  const supabase = createClient();
  
  // Fetch platform admin role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admin } = await supabase.from("platform_admins").select("role").eq("auth_user_id", user?.id || "").single();
  const isSuperAdmin = admin?.role === "super_admin";

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*, platform_admins(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Announcements</h1>
          <p className="text-slate-600">View and manage external messages sent to clinics.</p>
        </div>
        {isSuperAdmin && (
          <Link href="/announcements/create" className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />
            New Announcement
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">Title</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Channel</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Date</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Created By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {announcements?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{item.title}</td>
                <td className="px-6 py-4 text-slate-600 capitalize">{item.channel}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'sent' ? 'bg-green-100 text-green-700' :
                    item.status === 'failed' ? 'bg-red-100 text-red-700' :
                    item.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {item.platform_admins?.full_name || "Unknown"}
                </td>
              </tr>
            ))}
            {!announcements?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No announcements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
