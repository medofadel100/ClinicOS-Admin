"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createClinic(formData: FormData) {
  const supabase = createClient();
  
  const name = formData.get("name") as string;
  const clinic_type_id = formData.get("clinic_type_id") as string;
  const owner_full_name = formData.get("owner_full_name") as string;
  const owner_email = formData.get("owner_email") as string;
  const owner_phone = formData.get("owner_phone") as string;
  const status = formData.get("status") as "trial" | "active" | "past_due" | "suspended" | "cancelled";
  const plan_id = formData.get("plan_id") as string;
  const discount_code_str = formData.get("discount_code") as string;

  if (!name || !clinic_type_id || !owner_email || !owner_phone || !plan_id || !status) {
    return { error: "Missing required fields" };
  }

  // 1. Fetch the plan to snapshot its price
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("price_egp, billing_cycle")
    .eq("id", plan_id)
    .single();

  if (planError || !plan) {
    return { error: "Invalid plan" };
  }

  let finalPrice = plan.price_egp;
  let discount_code_id = null;

  if (discount_code_str && status !== "trial") {
    const { validateDiscountCodeServer } = await import("@/app/actions/discounts");
    const codeData = await validateDiscountCodeServer(discount_code_str, "new_subscription");
    if (!codeData.isValid) {
      return { error: (codeData as { error?: string }).error || "Invalid discount code" };
    }
    if (!("code" in codeData) || !codeData.code) {
      return { error: "Invalid discount code" };
    }
    const { calculateDiscountedPrice } = await import("@/lib/discounts");
    finalPrice = calculateDiscountedPrice(plan.price_egp, codeData.code);
    discount_code_id = codeData.code.id;
  }

  // 2. Insert Clinic
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .insert({
      name,
      clinic_type_id,
      owner_full_name,
      owner_email,
      owner_phone,
      status
    })
    .select()
    .single();

  if (clinicError || !clinic) {
    console.error("Clinic creation error:", clinicError);
    return { error: clinicError?.message || "Failed to create clinic" };
  }

  // 3. Calculate period dates based on trial or billing cycle
  const now = new Date();
  let trialEndsAt: Date | null = null;
  const currentPeriodStart = now;
  let currentPeriodEnd = new Date(now);

  if (status === "trial") {
    // 7 day trial
    trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    currentPeriodEnd = trialEndsAt; // Next billing occurs after trial ends
  } else {
    // Active / Paid immediately
    if (plan.billing_cycle === "monthly") {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }
  }

  // 4. Insert Subscription
  const { error: subError } = await supabase
    .from("clinic_subscriptions")
    .insert({
      clinic_id: clinic.id,
      plan_id: plan_id,
      status: status === "trial" ? "trial" : "active",
      price_locked_egp: status === "trial" ? plan.price_egp : finalPrice,
      discount_code_id: status === "trial" ? null : discount_code_id,
      trial_ends_at: trialEndsAt?.toISOString() || null,
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
    });

  if (subError) {
    console.error("Subscription creation error:", subError);
    // Ideally we would rollback the clinic creation here, but we are keeping it simple for this checkpoint.
    return { error: subError.message };
  }

  if (discount_code_id && status !== "trial") {
    await supabase.rpc("increment_discount_usage", { code_id: discount_code_id });
  }

  revalidatePath("/clinics");
  return { success: true, clinicId: clinic.id };
}

export async function changeClinicPlan(clinicId: string, newPlanId: string, discountCodeStr?: string) {
  const supabase = createClient();
  
  // 1. Fetch new plan
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("price_egp, billing_cycle")
    .eq("id", newPlanId)
    .single();

  if (planError || !plan) return { error: "Invalid plan" };

  let finalPrice = plan.price_egp;
  let discount_code_id = null;

  if (discountCodeStr) {
    const { validateDiscountCodeServer } = await import("@/app/actions/discounts");
    const codeData = await validateDiscountCodeServer(discountCodeStr, "renewal");
    if (!codeData.isValid) {
      return { error: (codeData as { error?: string }).error || "Invalid discount code" };
    }
    if (!("code" in codeData) || !codeData.code) {
      return { error: "Invalid discount code" };
    }
    const { calculateDiscountedPrice } = await import("@/lib/discounts");
    finalPrice = calculateDiscountedPrice(plan.price_egp, codeData.code);
    discount_code_id = codeData.code.id;
  }

  // 2. Fetch current active subscription to carry over dates if desired, 
  // but usually a plan change creates a new period or prorates.
  // For ClinicOS MVP, we just create a new active subscription with new period dates from today.
  const { data: currentSub } = await supabase
    .from("clinic_subscriptions")
    .select("*")
    .eq("clinic_id", clinicId)
    .in("status", ["active", "trial"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (currentSub) {
    // Cancel the old subscription
    await supabase
      .from("clinic_subscriptions")
      .update({ status: "cancelled" })
      .eq("id", currentSub.id);
  }

  // 3. Create new subscription
  const now = new Date();
  const currentPeriodEnd = new Date(now);
  if (plan.billing_cycle === "monthly") {
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  } else {
    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
  }

  const { error: subError } = await supabase
    .from("clinic_subscriptions")
    .insert({
      clinic_id: clinicId,
      plan_id: newPlanId,
      status: "active",
      price_locked_egp: finalPrice,
      discount_code_id,
      trial_ends_at: null,
      current_period_start: now.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
    });

  if (subError) {
    console.error(subError);
    return { error: "Failed to create new subscription" };
  }

  if (discount_code_id) {
    await supabase.rpc("increment_discount_usage", { code_id: discount_code_id });
  }

  // 4. Update clinic status if it was trial
  await supabase
    .from("clinics")
    .update({ status: "active" })
    .eq("id", clinicId);

  revalidatePath(`/clinics/${clinicId}`);
  revalidatePath("/clinics");
  return { success: true };
}

export async function createOverride(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: admin } = await supabase.from("platform_admins").select("id").eq("auth_user_id", user.id).single();
  if (!admin) return { error: "Admin not found" };

  const clinic_id = formData.get("clinic_id") as string;
  const feature_id = formData.get("feature_id") as string;
  const override_type = formData.get("override_type") as "grant" | "revoke";
  const price_addon_egp = formData.get("price_addon_egp") ? parseFloat(formData.get("price_addon_egp") as string) : null;
  const note = formData.get("note") as string || null;
  const expires_at = formData.get("expires_at") ? new Date(formData.get("expires_at") as string).toISOString() : null;

  if (!clinic_id || !feature_id || !override_type) {
    return { error: "Missing required fields" };
  }

  const { error } = await supabase.from("account_feature_overrides").insert({
    clinic_id,
    feature_id,
    override_type,
    price_addon_egp,
    note,
    granted_by: admin.id,
    expires_at
  });

  if (error) {
    console.error(error);
    return { error: "Failed to create override" };
  }

  revalidatePath(`/clinics/${clinic_id}`);
  return { success: true };
}

export async function deleteOverride(overrideId: string, clinicId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("account_feature_overrides")
    .delete()
    .eq("id", overrideId);

  if (error) {
    console.error(error);
    return { error: "Failed to delete override" };
  }

  revalidatePath(`/clinics/${clinicId}`);
  return { success: true };
}
