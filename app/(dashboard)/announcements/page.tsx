import { createClient } from "@/lib/supabase/server";
import { AnnouncementsClient } from "./_components/announcements-client";

export default async function AnnouncementsPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admin } = await supabase.from("platform_admins").select("role").eq("auth_user_id", user?.id || "").single();
  const isSuperAdmin = admin?.role === "super_admin";

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*, platform_admins(full_name)")
    .order("created_at", { ascending: false });

  return <AnnouncementsClient announcements={announcements || []} isSuperAdmin={isSuperAdmin} />;
}
