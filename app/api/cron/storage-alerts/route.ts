import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: settings } = await supabase
      .from("clinic_settings")
      .select("clinic_id, setting_value")
      .eq("setting_key", "storage_quota_mb");

    if (!settings || settings.length === 0) {
      return NextResponse.json({ message: "No clinics with storage quotas" });
    }

    const clinicIds = settings.map((s) => s.clinic_id);

    const { data: allFiles } = await supabase
      .from("patient_uploaded_files")
      .select("clinic_id, file_size")
      .in("clinic_id", clinicIds);

    const { data: allClinics } = await supabase
      .from("clinics")
      .select("id, name")
      .in("id", clinicIds);

    const clinicMap = new Map((allClinics || []).map((c) => [c.id, c]));

    const fileUsage = new Map<string, number>();
    for (const file of allFiles || []) {
      fileUsage.set(file.clinic_id, (fileUsage.get(file.clinic_id) || 0) + (file.file_size || 0));
    }

    const today = new Date().toISOString().split("T")[0];
    const { data: existingNotifs } = await supabase
      .from("notifications")
      .select("link_url")
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59`);

    const existingClinicIds = new Set(
      (existingNotifs || []).map((n) => {
        const match = n.link_url?.match(/clinic=([a-f0-9-]+)/);
        return match?.[1];
      }).filter(Boolean)
    );

    const notifications: { title: string; body: string; clinic_id: string }[] = [];

    for (const setting of settings) {
      if (existingClinicIds.has(setting.clinic_id)) continue;

      const quotaMB = parseInt(setting.setting_value) || 0;
      if (quotaMB <= 0) continue;

      const usedBytes = fileUsage.get(setting.clinic_id) || 0;
      const usedMB = usedBytes / (1024 * 1024);
      const percentUsed = Math.round((usedMB / quotaMB) * 100);

      if (percentUsed < 80) continue;

      const clinic = clinicMap.get(setting.clinic_id);
      const clinicName = clinic?.name || "Unknown";
      const usedGB = Math.round((usedMB / 1024) * 100) / 100;
      const quotaGB = Math.round((quotaMB / 1024) * 100) / 100;

      const isFull = percentUsed >= 100;
      const isCritical = percentUsed >= 95;

      notifications.push({
        title: isFull
          ? `Storage Full: ${clinicName}`
          : isCritical
          ? `Storage Critical: ${clinicName}`
          : `Storage Warning: ${clinicName}`,
        body: `"${clinicName}" used ${percentUsed}% (${usedGB}GB / ${quotaGB}GB)`,
        clinic_id: setting.clinic_id,
      });
    }

    if (notifications.length === 0) {
      return NextResponse.json({ success: true, alerts_created: 0 });
    }

    const { data: admins } = await supabase
      .from("platform_admins")
      .select("id")
      .eq("role", "super_admin")
      .eq("is_active", true);

    let createdCount = 0;
    for (const notif of notifications) {
      const { data: notifData } = await supabase
        .from("notifications")
        .insert({
          title: notif.title,
          body: notif.body,
          notification_type: "system_event",
          link_url: `/storage?clinic=${notif.clinic_id}`,
        })
        .select("id")
        .single();

      if (notifData && admins && admins.length > 0) {
        const recipients = admins.map((admin) => ({
          notification_id: notifData.id,
          admin_id: admin.id,
        }));
        await supabase.from("notification_recipients").insert(recipients);
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      alerts_created: createdCount,
    });
  } catch (error) {
    console.error("Storage alerts cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
