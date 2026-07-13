import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BroadcastForm } from "./_components/broadcast-form";

export default async function BroadcastNotificationPage() {
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
        You do not have permission to broadcast internal notifications.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Broadcast Notification</h1>
        <p className="text-slate-600">Send an internal message to the admin team.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <BroadcastForm />
      </div>
    </div>
  );
}
