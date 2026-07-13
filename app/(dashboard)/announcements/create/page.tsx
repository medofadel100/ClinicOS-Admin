import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CreateAnnouncementForm } from "./_components/create-form";

export default async function CreateAnnouncementPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (admin?.role !== "super_admin") {
    return (
      <div className="p-8 text-center text-slate-500">
        You do not have permission to create announcements.
      </div>
    );
  }

  // Fetch plans for filtering
  const { data: plans } = await supabase.from("plans").select("id, name_en");

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">New Announcement</h1>
        <p className="text-slate-600">Send an email or WhatsApp message to clinic owners.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <CreateAnnouncementForm plans={plans || []} />
      </div>
    </div>
  );
}
