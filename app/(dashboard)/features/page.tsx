import { createClient } from "@/lib/supabase/server";
import { FeaturesClient } from "./_components/features-client";

export default async function FeaturesPage() {
  const supabase = createClient();
  
  const { data: features } = await supabase
    .from("features")
    .select("*")
    .order("created_at", { ascending: false });

  return <FeaturesClient features={features || []} />;
}
