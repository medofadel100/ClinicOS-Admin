import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPlanLimit(formData: FormData) {
  "use server";
  const plan_id = formData.get("plan_id") as string;
  const limit_type = formData.get("limit_type") as "provider_seats" | "patients" | "staff_accounts";
  const max_value = formData.get("max_value") ? parseInt(formData.get("max_value") as string) : null;
  
  const supabase = createClient();
  await supabase.from("plan_limits").upsert({
    plan_id,
    limit_type,
    max_value,
  }, { onConflict: "plan_id, limit_type" });
  
  revalidatePath(`/plans/${plan_id}`);
  revalidatePath("/plans");
}

export async function removePlanLimit(id: string, plan_id: string) {
  "use server";
  const supabase = createClient();
  await supabase.from("plan_limits").delete().eq("id", id);
  revalidatePath(`/plans/${plan_id}`);
  revalidatePath("/plans");
}

export async function addPlanFeature(plan_id: string, feature_id: string) {
  "use server";
  const supabase = createClient();
  await supabase.from("plan_features").insert({ plan_id, feature_id });
  revalidatePath(`/plans/${plan_id}`);
  revalidatePath("/plans");
}

export async function removePlanFeature(plan_id: string, feature_id: string) {
  "use server";
  const supabase = createClient();
  await supabase.from("plan_features").delete().match({ plan_id, feature_id });
  revalidatePath(`/plans/${plan_id}`);
  revalidatePath("/plans");
}
