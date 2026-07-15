"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { issueOrUpdateLicense } from "@/lib/license";

export async function suspendLicense(clinicId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("clinic_licenses")
    .update({ status: "suspended" })
    .eq("clinic_id", clinicId);

  if (error) {
    console.error(error);
    return { error: "Failed to suspend license" };
  }

  revalidatePath(`/clinics/${clinicId}`);
  return { success: true };
}

export async function revokeLicense(clinicId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("clinic_licenses")
    .update({ status: "revoked" })
    .eq("clinic_id", clinicId);

  if (error) {
    console.error(error);
    return { error: "Failed to revoke license" };
  }

  revalidatePath(`/clinics/${clinicId}`);
  return { success: true };
}

export async function activateLicense(clinicId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("clinic_licenses")
    .update({ status: "active" })
    .eq("clinic_id", clinicId);

  if (error) {
    console.error(error);
    return { error: "Failed to activate license" };
  }

  revalidatePath(`/clinics/${clinicId}`);
  return { success: true };
}

export async function regenerateLicense(clinicId: string) {
  const supabase = createClient();
  
  // We need to fetch the active subscription to know the expiresAt date
  const { data: currentSub } = await supabase
    .from("clinic_subscriptions")
    .select("current_period_end")
    .eq("clinic_id", clinicId)
    .in("status", ["active", "trial"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!currentSub) {
    return { error: "Cannot regenerate license without an active subscription" };
  }

  try {
    await issueOrUpdateLicense(clinicId, new Date(currentSub.current_period_end));
  } catch (err: unknown) {
    console.error("LICENSE_GENERATION_ERROR:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath(`/clinics/${clinicId}`);
  return { success: true };
}

export async function deactivateDevice(activationId: string, clinicId: string) {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: activation, error: fetchError } = await supabase
    .from("license_activations")
    .select("license_id, license:clinic_licenses(clinic_id)")
    .eq("id", activationId)
    .single();

  if (fetchError || !activation) {
    return { error: "Activation not found" };
  }

  const { error: updateError } = await supabase
    .from("license_activations")
    .update({ deactivated_at: now })
    .eq("id", activationId);

  if (updateError) {
    return { error: "Failed to deactivate device" };
  }

  // Decrement activation_count
  const { data: currentLicense } = await supabase
    .from("clinic_licenses")
    .select("activation_count")
    .eq("id", activation.license_id)
    .single();

  if (currentLicense && currentLicense.activation_count > 0) {
    await supabase
      .from("clinic_licenses")
      .update({ activation_count: currentLicense.activation_count - 1 })
      .eq("id", activation.license_id);
  }
  revalidatePath(`/clinics/${clinicId}`);
  return { success: true };
}

export async function updateMaxActivations(clinicId: string, maxActivations: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("clinic_licenses")
    .update({ max_activations: maxActivations })
    .eq("clinic_id", clinicId);

  if (error) {
    console.error(error);
    return { error: "Failed to update max activations" };
  }

  revalidatePath(`/clinics/${clinicId}`);
  return { success: true };
}
