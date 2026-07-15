import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BroadcastPageClient } from "./_components/broadcast-page-client";

export default async function BroadcastNotificationPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  const hasPermission = admin?.role === "super_admin";

  return <BroadcastPageClient hasPermission={hasPermission} />;
}
