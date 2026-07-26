import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PlanDetailClient } from "./_components/plan-detail-client";

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const [
    { data: plan },
    { data: allFeatures },
  ] = await Promise.all([
    supabase.from("plans").select("*, plan_limits(*), plan_features(*, features(*))").eq("id", params.id).single(),
    supabase.from("features").select("*").eq("is_active", true).order("name_en", { ascending: true })
  ]);

  if (!plan) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeFeatureIds = plan.plan_features.map((pf: any) => pf.feature_id);
  const unassignedFeatures = allFeatures?.filter(f => !activeFeatureIds.includes(f.id)) || [];

  return <PlanDetailClient plan={plan} unassignedFeatures={unassignedFeatures} />;
}
