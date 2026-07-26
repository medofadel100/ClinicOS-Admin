import { createClient } from "@/lib/supabase/server";
import UpgradesClient from "./_components/upgrades-client";

interface SearchParams {
  status?: string;
}

export default async function UpgradesPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient();
  let activeStatus: "open" | "contacted" | "resolved" = "open";
  if (searchParams.status === "contacted" || searchParams.status === "resolved") {
    activeStatus = searchParams.status;
  }

  const { data: requests, error } = await supabase
    .from("upgrade_requests")
    .select(`
      id,
      requested_by_name,
      message,
      status,
      created_at,
      clinics (
        name
      ),
      features (
        name_en,
        name_ar
      )
    `)
    .eq("status", activeStatus)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching upgrades:", error.message);
  }

  return <UpgradesClient requests={requests ?? []} activeStatus={activeStatus} />;
}
