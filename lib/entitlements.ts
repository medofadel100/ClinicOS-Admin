import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import { Database } from "../types/database";

type Feature = Database["public"]["Tables"]["features"]["Row"];
type FeatureWithPriceAddon = Feature & { price_addon_egp?: number | null };

export async function getClinicEntitlements(clinicId: string, customClient?: SupabaseClient) {
  const supabase = customClient || createClient();

  // 1. Get the clinic's active subscription and its plan's features
  const { data: sub } = await supabase
    .from("clinic_subscriptions")
    .select(`
      plan_id,
      plans (
        plan_features (
          features (*)
        )
      )
    `)
    .eq("clinic_id", clinicId)
    .in("status", ["active", "trial"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // 2. Get the clinic's overrides
  const { data: overrides } = await supabase
    .from("account_feature_overrides")
    .select("*, features(*)")
    .eq("clinic_id", clinicId);

  // Initialize with plan features (if any subscription exists)
  const effectiveFeatures = new Map<string, FeatureWithPriceAddon>();
  
  const plansData = sub && sub.plans ? (Array.isArray(sub.plans) ? sub.plans[0] : (sub.plans as unknown as { plan_features: { features: Feature | Feature[] | null }[] })) : null;
  if (sub && plansData && plansData.plan_features) {
    for (const pf of plansData.plan_features) {
      const feature = Array.isArray(pf.features) ? pf.features[0] : pf.features;
      if (feature) {
        effectiveFeatures.set(feature.id, feature as FeatureWithPriceAddon);
      }
    }
  }

  // 3. Apply overrides
  if (overrides) {
    const now = new Date();
    for (const override of overrides) {
      // Ignore expired overrides
      if (override.expires_at && new Date(override.expires_at) < now) {
        continue;
      }

      if (override.override_type === "revoke") {
        effectiveFeatures.delete(override.feature_id);
      } else if (override.override_type === "grant" && override.features) {
        // We inject the extra price_addon_egp into the feature object so the UI can show it if needed
        const feature = { ...override.features, price_addon_egp: override.price_addon_egp };
        effectiveFeatures.set(override.feature_id, feature);
      }
    }
  }

  return Array.from(effectiveFeatures.values());
}
