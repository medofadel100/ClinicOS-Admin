import { createClient } from "@/lib/supabase/server";
import { PlansClient } from "./_components/plans-client";

export default async function PlansPage() {
  const supabase = createClient();
  
  const { data: plans } = await supabase
    .from("plans")
    .select("*, plan_limits(*), plan_features(*)")
    .order("price_egp", { ascending: true });

  return <PlansClient plans={plans || []} />;
}
