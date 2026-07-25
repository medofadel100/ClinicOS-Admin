"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ClinicStorageInfo {
  clinic_id: string;
  clinic_name: string;
  owner_name: string;
  used_mb: number;
  quota_mb: number;
  used_gb: number;
  quota_gb: number;
  percent_used: number;
  file_count: number;
  status: "normal" | "warning" | "critical" | "full";
}

export interface StorageOverview {
  clinics: ClinicStorageInfo[];
  totals: {
    total_clinics: number;
    total_used_gb: number;
    total_quota_gb: number;
    clinics_warning: number;
    clinics_critical: number;
    clinics_full: number;
  };
}

export interface StorageOption {
  code: string;
  label_en: string;
  label_ar: string;
  mb: number;
}

export async function getStorageOptions(): Promise<StorageOption[]> {
  const supabase = createClient();
  const { data: features } = await supabase
    .from("features")
    .select("code, name_ar, name_en, base_price_egp")
    .eq("category", "storage")
    .eq("is_active", true)
    .order("base_price_egp", { ascending: true });

  if (!features) return [];

  return features.map((f) => ({
    code: f.code,
    label_en: f.name_en,
    label_ar: f.name_ar,
    mb: f.code === "extra_storage_5gb" ? 5120 : f.code === "extra_storage_10gb" ? 10240 : 51200,
  }));
}

export async function getStorageOverview(): Promise<StorageOverview> {
  const supabase = createClient();

  // Get all clinics with storage quotas
  const { data: settings } = await supabase
    .from("clinic_settings")
    .select("clinic_id, setting_value")
    .eq("setting_key", "storage_quota_mb");

  if (!settings || settings.length === 0) {
    return {
      clinics: [],
      totals: {
        total_clinics: 0,
        total_used_gb: 0,
        total_quota_gb: 0,
        clinics_warning: 0,
        clinics_critical: 0,
        clinics_full: 0,
      },
    };
  }

  const clinicIds = settings.map((s) => s.clinic_id);

  // Batch: get all files grouped by clinic_id
  const { data: allFiles } = await supabase
    .from("patient_uploaded_files")
    .select("clinic_id, file_size")
    .in("clinic_id", clinicIds);

  // Batch: get all clinic info
  const { data: allClinics } = await supabase
    .from("clinics")
    .select("id, name, owner_full_name")
    .in("id", clinicIds);

  const clinicMap = new Map(
    (allClinics || []).map((c) => [c.id, c])
  );

  // Group file sizes by clinic
  const fileUsage = new Map<string, { usedBytes: number; fileCount: number }>();
  for (const file of allFiles || []) {
    const existing = fileUsage.get(file.clinic_id) || { usedBytes: 0, fileCount: 0 };
    existing.usedBytes += file.file_size || 0;
    existing.fileCount += 1;
    fileUsage.set(file.clinic_id, existing);
  }

  const results: ClinicStorageInfo[] = settings.map((setting) => {
    const quotaMB = parseInt(setting.setting_value) || 0;
    const usage = fileUsage.get(setting.clinic_id) || { usedBytes: 0, fileCount: 0 };
    const usedMB = usage.usedBytes / (1024 * 1024);
    const percentUsed = quotaMB > 0 ? Math.round((usedMB / quotaMB) * 100) : 0;
    const clinic = clinicMap.get(setting.clinic_id);

    let status: ClinicStorageInfo["status"] = "normal";
    if (percentUsed >= 100) status = "full";
    else if (percentUsed >= 95) status = "critical";
    else if (percentUsed >= 80) status = "warning";

    return {
      clinic_id: setting.clinic_id,
      clinic_name: clinic?.name || "Unknown Clinic",
      owner_name: clinic?.owner_full_name || "",
      used_mb: Math.round(usedMB * 100) / 100,
      quota_mb: quotaMB,
      used_gb: Math.round((usedMB / 1024) * 100) / 100,
      quota_gb: Math.round((quotaMB / 1024) * 100) / 100,
      percent_used: percentUsed,
      file_count: usage.fileCount,
      status,
    };
  }).sort((a, b) => b.percent_used - a.percent_used);

  return {
    clinics: results,
    totals: {
      total_clinics: results.length,
      total_used_gb: Math.round(results.reduce((s, c) => s + c.used_gb, 0) * 100) / 100,
      total_quota_gb: Math.round(results.reduce((s, c) => s + c.quota_gb, 0) * 100) / 100,
      clinics_warning: results.filter((c) => c.status === "warning").length,
      clinics_critical: results.filter((c) => c.status === "critical").length,
      clinics_full: results.filter((c) => c.status === "full").length,
    },
  };
}

export async function increaseClinicStorage(
  clinicId: string,
  featureCode: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: adminRecord } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!adminRecord) return { error: "Not a platform admin" };

  // Check for duplicate grant
  const { data: existingFeature } = await supabase
    .from("features")
    .select("id")
    .eq("code", featureCode)
    .single();

  if (!existingFeature) return { error: "Feature not found" };

  const { data: existingOverride } = await supabase
    .from("account_feature_overrides")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("feature_id", existingFeature.id)
    .eq("override_type", "grant")
    .maybeSingle();

  if (existingOverride) {
    return { error: "This storage add-on is already granted to this clinic." };
  }

  // Get feature price for the override
  const { data: feature } = await supabase
    .from("features")
    .select("base_price_egp")
    .eq("code", featureCode)
    .single();

  // Grant the feature
  const { error: overrideErr } = await supabase
    .from("account_feature_overrides")
    .insert({
      clinic_id: clinicId,
      feature_id: existingFeature.id,
      override_type: "grant",
      price_addon_egp: feature?.base_price_egp || 0,
      granted_by: adminRecord.id,
      note: `Storage add-on: ${featureCode}`,
    });

  if (overrideErr) return { error: overrideErr.message };

  await recalculateStorageQuota(clinicId);
  revalidatePath("/storage", "page");
  return { success: true };
}

async function recalculateStorageQuota(clinicId: string): Promise<number> {
  const supabase = createClient();

  const { data: sub } = await supabase
    .from("clinic_subscriptions")
    .select("plan_id")
    .eq("clinic_id", clinicId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let baseStorageMB = 0;
  if (sub) {
    const { data: limit } = await supabase
      .from("plan_limits")
      .select("max_value")
      .eq("plan_id", sub.plan_id)
      .eq("limit_type", "storage_mb")
      .single();
    baseStorageMB = limit?.max_value || 0;
  }

  const { data: overrides } = await supabase
    .from("account_feature_overrides")
    .select("feature:features(code)")
    .eq("clinic_id", clinicId)
    .eq("override_type", "grant");

  let extraStorageMB = 0;
  for (const override of overrides || []) {
    const feature = override.feature as { code: string } | null;
    if (feature?.code === "extra_storage_5gb") extraStorageMB += 5120;
    if (feature?.code === "extra_storage_10gb") extraStorageMB += 10240;
    if (feature?.code === "extra_storage_50gb") extraStorageMB += 51200;
  }

  const totalMB = baseStorageMB + extraStorageMB;

  await supabase.from("clinic_settings").upsert(
    { clinic_id: clinicId, setting_key: "storage_quota_mb", setting_value: String(totalMB) },
    { onConflict: "clinic_id,setting_key" }
  );

  return totalMB;
}

export async function removeStorageFeature(
  clinicId: string,
  overrideId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error: deleteErr } = await supabase
    .from("account_feature_overrides")
    .delete()
    .eq("id", overrideId);

  if (deleteErr) return { error: deleteErr.message };

  await recalculateStorageQuota(clinicId);
  revalidatePath("/storage", "page");
  return { success: true };
}
