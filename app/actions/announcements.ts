"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Json } from "@/types/database";

export async function submitAnnouncement(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (admin?.role !== "super_admin") {
    return { error: "Only Super Admins can create announcements" };
  }

  const title = formData.get("title") as string;
  const channel = formData.get("channel") as "email" | "whatsapp" | "both";
  const subject = formData.get("subject") as string || null;
  const body = formData.get("body") as string;
  const audience_filter_str = formData.get("audience_filter") as string;
  
  if (!title || !channel || !body) return { error: "Missing required fields" };

  let audience_filter: Record<string, string | undefined> = {};
  try {
    audience_filter = JSON.parse(audience_filter_str);
  } catch {
    return { error: "Invalid audience filter" };
  }

  // 1. Create Announcement
  const { data: announcement, error: insertError } = await supabase
    .from("announcements")
    .insert({
      title,
      channel,
      subject,
      body,
      audience_filter: audience_filter as unknown as Json,
      status: "sending",
      created_by: admin.id
    })
    .select()
    .single();

  if (insertError || !announcement) {
    console.error(insertError);
    return { error: "Failed to create announcement" };
  }

  // 2. Resolve audience
  let query = supabase.from("clinics").select("id, owner_email, owner_phone, name, owner_full_name");
  
  if (audience_filter.status) {
    query = query.eq("status", audience_filter.status as "trial" | "active" | "past_due" | "suspended" | "cancelled");
  }

  const { data: clinics, error: queryError } = await query;

  if (queryError || !clinics) {
    return { error: "Failed to fetch audience" };
  }

  // If filter by plan is required, we need to join with subscriptions
  let finalClinics = clinics;
  if (audience_filter.plan_id) {
    const { data: subs } = await supabase
      .from("clinic_subscriptions")
      .select("clinic_id")
      .eq("plan_id", audience_filter.plan_id)
      .in("status", ["active", "trial"]);
      
    const validClinicIds = new Set(subs?.map(s => s.clinic_id) || []);
    finalClinics = clinics.filter(c => validClinicIds.has(c.id));
  }

  if (finalClinics.length === 0) {
    await supabase.from("announcements").update({ status: "sent" }).eq("id", announcement.id);
    return { error: "Audience filter matched 0 clinics. Announcement marked as sent." };
  }

  // 3. Create Recipients
  const recipientInserts: { announcement_id: string, clinic_id: string, channel: "email" | "whatsapp", status: "pending" }[] = [];
  for (const clinic of finalClinics) {
    if (channel === "email" || channel === "both") {
      recipientInserts.push({
        announcement_id: announcement.id,
        clinic_id: clinic.id,
        channel: "email",
        status: "pending"
      });
    }
    if (channel === "whatsapp" || channel === "both") {
      recipientInserts.push({
        announcement_id: announcement.id,
        clinic_id: clinic.id,
        channel: "whatsapp",
        status: "pending"
      });
    }
  }

  const { error: recipientError } = await supabase
    .from("announcement_recipients")
    .insert(recipientInserts);

  if (recipientError) {
    console.error(recipientError);
    return { error: "Failed to create recipient records" };
  }

  // 4. Trigger Dispatcher asynchronously (Fire and Forget)
  dispatchAnnouncements(announcement.id).catch(console.error);

  revalidatePath("/announcements");
  return { success: true };
}

// Background dispatcher (simulated for serverless environment)
async function dispatchAnnouncements(announcement_id: string) {
  // We dynamically import to avoid loading senders in the edge runtime if not needed
  const { sendTransactionalEmail } = await import("@/lib/email/sender");
  const { sendWhatsAppMessage } = await import("@/lib/whatsapp/sender");
  
  // Need a new client with service role since we are running in background without request context
  // Wait, in Next.js background fetch, we can't easily rely on cookies. We must use admin client.
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const adminClient = createAdminClient();

  const { data: announcement } = await adminClient.from("announcements").select("*").eq("id", announcement_id).single();
  if (!announcement) return;

  const { data: recipients } = await adminClient
    .from("announcement_recipients")
    .select("*, clinics(name, owner_full_name, owner_email, owner_phone)")
    .eq("announcement_id", announcement_id)
    .eq("status", "pending");

  if (!recipients || recipients.length === 0) {
    await adminClient.from("announcements").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", announcement_id);
    return;
  }

  for (const recipient of recipients) {
    try {
      const clinic = recipient.clinics as { name: string, owner_full_name: string, owner_email: string, owner_phone: string };
      const body = announcement.body
        .replace("{{clinic_name}}", clinic.name)
        .replace("{{owner_name}}", clinic.owner_full_name);

      if (recipient.channel === "email") {
        await sendTransactionalEmail({
          to: clinic.owner_email,
          subject: announcement.subject || "ClinicOS Update",
          body: body
        });
      } else if (recipient.channel === "whatsapp") {
        await sendWhatsAppMessage({
          to: clinic.owner_phone,
          body: body
        });
        // Strict rate-limiting for WhatsApp to prevent bans (e.g. 5 seconds between messages)
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      await adminClient.from("announcement_recipients").update({ 
        status: "sent", 
        sent_at: new Date().toISOString() 
      }).eq("id", recipient.id);

    } catch (e: unknown) {
      await adminClient.from("announcement_recipients").update({ 
        status: "failed", 
        error_message: e instanceof Error ? e.message : "Unknown error" 
      }).eq("id", recipient.id);
    }
  }

  // Check if all are done
  const { count } = await adminClient
    .from("announcement_recipients")
    .select("*", { count: 'exact', head: true })
    .eq("announcement_id", announcement_id)
    .eq("status", "pending");

  if (count === 0) {
    await adminClient.from("announcements").update({ 
      status: "sent", 
      sent_at: new Date().toISOString() 
    }).eq("id", announcement_id);
  }
}
