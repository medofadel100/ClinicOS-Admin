"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function suspendClinic(clinicId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: admin } = await supabase.from("platform_admins").select("id").eq("auth_user_id", user.id).single();
  if (!admin) return { error: "Admin not found" };

  // 1. Update clinic status
  const { data: oldClinic, error: cErr1 } = await supabase.from("clinics").select("*").eq("id", clinicId).single();
  const { error: cErr2, data: newClinic } = await supabase.from("clinics").update({ status: "suspended" }).eq("id", clinicId).select().single();
  
  if (cErr1 || cErr2) return { error: "Failed to suspend clinic" };

  // 2. Audit log for clinic status change
  await supabase.from("audit_log").insert({
    actor_admin_id: admin.id,
    action: "clinic.suspended",
    target_table: "clinics",
    target_id: clinicId,
    old_value: oldClinic,
    new_value: newClinic
  });

  // 3. Update license status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const licenseRes: any = await supabase.from("clinic_licenses" as any).select("*").eq("clinic_id", clinicId).single();
  const oldLicense = licenseRes.data;
  if (oldLicense) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateRes: any = await supabase.from("clinic_licenses" as any).update({ status: "suspended" }).eq("id", oldLicense.id).select().single();
    const newLicense = updateRes.data;
    await supabase.from("audit_log").insert({
      actor_admin_id: admin.id,
      action: "license.suspended",
      target_table: "clinic_licenses",
      target_id: oldLicense.id,
      old_value: oldLicense,
      new_value: newLicense
    });
  }

  revalidatePath(`/clinics/${clinicId}`);
  revalidatePath("/clinics");
  return { success: true };
}

export async function cancelClinic(clinicId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: admin } = await supabase.from("platform_admins").select("id").eq("auth_user_id", user.id).single();
  if (!admin) return { error: "Admin not found" };

  // 1. Update clinic status
  const { data: oldClinic } = await supabase.from("clinics").select("*").eq("id", clinicId).single();
  const { data: newClinic } = await supabase.from("clinics").update({ status: "cancelled" }).eq("id", clinicId).select().single();
  
  await supabase.from("audit_log").insert({
    actor_admin_id: admin.id,
    action: "clinic.cancelled",
    target_table: "clinics",
    target_id: clinicId,
    old_value: oldClinic,
    new_value: newClinic
  });

  // 2. Update active/trial subscriptions
  const { data: currentSubs } = await supabase
    .from("clinic_subscriptions")
    .select("*")
    .eq("clinic_id", clinicId)
    .in("status", ["active", "trial"]);

  if (currentSubs && currentSubs.length > 0) {
    for (const sub of currentSubs) {
      await supabase.from("clinic_subscriptions").update({ status: "cancelled" }).eq("id", sub.id);
      // Trigger automatically handles audit log
    }
  }

  // 3. Update license status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const licenseRes: any = await supabase.from("clinic_licenses" as any).select("*").eq("clinic_id", clinicId).single();
  const oldLicense = licenseRes.data;
  if (oldLicense) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateRes: any = await supabase.from("clinic_licenses" as any).update({ status: "revoked" }).eq("id", oldLicense.id).select().single();
    const newLicense = updateRes.data;
    await supabase.from("audit_log").insert({
      actor_admin_id: admin.id,
      action: "license.revoked",
      target_table: "clinic_licenses",
      target_id: oldLicense.id,
      old_value: oldLicense,
      new_value: newLicense
    });
  }

  revalidatePath(`/clinics/${clinicId}`);
  revalidatePath("/clinics");
  return { success: true };
}

export async function reactivateClinic(clinicId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: admin } = await supabase.from("platform_admins").select("id").eq("auth_user_id", user.id).single();
  if (!admin) return { error: "Admin not found" };

  // Note: Only suspended clinics can be reactivated. Cancelled clinics need a new subscription flow.
  const { data: oldClinic } = await supabase.from("clinics").select("*").eq("id", clinicId).single();
  if (!oldClinic || oldClinic.status !== "suspended") {
    return { error: "Only suspended clinics can be reactivated directly." };
  }

  const { data: newClinic } = await supabase.from("clinics").update({ status: "active" }).eq("id", clinicId).select().single();
  
  await supabase.from("audit_log").insert({
    actor_admin_id: admin.id,
    action: "clinic.reactivated",
    target_table: "clinics",
    target_id: clinicId,
    old_value: oldClinic,
    new_value: newClinic
  });

  // Update license status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const licenseRes: any = await supabase.from("clinic_licenses" as any).select("*").eq("clinic_id", clinicId).single();
  const oldLicense = licenseRes.data;
  if (oldLicense && oldLicense.status === "suspended") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateRes: any = await supabase.from("clinic_licenses" as any).update({ status: "active" }).eq("id", oldLicense.id).select().single();
    const newLicense = updateRes.data;
    await supabase.from("audit_log").insert({
      actor_admin_id: admin.id,
      action: "license.reactivated",
      target_table: "clinic_licenses",
      target_id: oldLicense.id,
      old_value: oldLicense,
      new_value: newLicense
    });
  }

  revalidatePath(`/clinics/${clinicId}`);
  revalidatePath("/clinics");
  return { success: true };
}
