import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CreateAnnouncementClient } from "./_components/create-announcement-client";

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

  const { data: plans } = await supabase.from("plans").select("id, name_en");

  return <CreateAnnouncementClient plans={plans || []} />;
}
