"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function recordPayment(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: admin } = await supabase.from("platform_admins").select("id").eq("auth_user_id", user.id).single();
  if (!admin) return { error: "Admin not found" };

  const clinic_id = formData.get("clinic_id") as string;
  const subscription_id_raw = formData.get("subscription_id") as string;
  const subscription_id = subscription_id_raw ? subscription_id_raw : null;
  const amount_egp = parseFloat(formData.get("amount_egp") as string);
  const payment_method = formData.get("payment_method") as "bank_transfer" | "cash" | "vodafone_cash" | "instapay" | "other";
  const status = formData.get("status") as "pending" | "confirmed" | "failed";
  const paid_at = formData.get("paid_at") ? new Date(formData.get("paid_at") as string).toISOString() : new Date().toISOString();
  const reference_note = formData.get("reference_note") as string || null;

  if (!clinic_id || isNaN(amount_egp) || !payment_method || !status) {
    return { error: "Missing required fields" };
  }

  const { error } = await supabase.from("payments").insert({
    clinic_id,
    subscription_id,
    amount_egp,
    payment_method,
    status,
    reference_note,
    recorded_by: admin.id,
    paid_at
  });

  if (error) {
    console.error(error);
    return { error: "Failed to record payment: " + error.message };
  }

  revalidatePath(`/clinics/${clinic_id}`);
  revalidatePath("/payments");
  return { success: true };
}
