import { createClient } from "@/lib/supabase/server";
import { AdminsClient } from "./_components/admins-client";

export default async function AdminsPage() {
  const supabase = createClient();

  const { data: admins } = await supabase
    .from("platform_admins")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminsClient admins={admins} />;
}
