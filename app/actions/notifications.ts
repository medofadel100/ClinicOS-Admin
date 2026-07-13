"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database";

type AdminRole = Database["public"]["Enums"]["admin_role"];

export async function broadcastNotification(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (admin?.role !== "super_admin") {
    return { error: "Only Super Admins can broadcast notifications" };
  }

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const link_url = formData.get("link_url") as string || null;
  const target_role_str = formData.get("target_role") as string;
  const target_role = target_role_str ? (target_role_str as AdminRole) : null;

  if (!title || !body) return { error: "Missing required fields" };

  // 1. Create Notification
  const { data: notification, error: insertError } = await supabase
    .from("notifications")
    .insert({
      title,
      body,
      link_url,
      target_role,
      notification_type: "manual_broadcast",
      created_by: admin.id
    })
    .select()
    .single();

  if (insertError || !notification) {
    console.error(insertError);
    return { error: "Failed to create notification" };
  }

  // 2. Resolve audience
  let query = supabase.from("platform_admins").select("id").eq("is_active", true);
  if (target_role) {
    query = query.eq("role", target_role);
  }

  const { data: targetAdmins, error: queryError } = await query;

  if (queryError || !targetAdmins) {
    return { error: "Failed to fetch audience" };
  }

  if (targetAdmins.length === 0) {
    return { error: "No active admins found with that role." };
  }

  // 3. Create Recipients
  const recipientInserts = targetAdmins.map(a => ({
    notification_id: notification.id,
    admin_id: a.id
  }));

  const { error: recipientError } = await supabase
    .from("notification_recipients")
    .insert(recipientInserts);

  if (recipientError) {
    console.error(recipientError);
    return { error: "Failed to create recipient records" };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function markNotificationRead(recipientId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!admin) return { error: "Admin not found" };

  const { error } = await supabase
    .from("notification_recipients")
    .update({ read_at: new Date().toISOString() })
    .eq("id", recipientId)
    .eq("admin_id", admin.id); // RLS also enforces this

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
