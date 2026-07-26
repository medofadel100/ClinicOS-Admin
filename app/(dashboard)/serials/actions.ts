"use server";

import { createClient } from "@/lib/supabase/server";

function generateSerialCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getSerials() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("clinic_serials")
    .select(`
      *,
      plans!clinic_serials_plan_id_fkey (id, name_ar, name_en, code, price_egp),
      clinics!clinic_serials_clinic_id_fkey (id, name),
      platform_admins!clinic_serials_created_by_fkey (full_name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPlans() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("id, name_ar, name_en, code, price_egp")
    .eq("is_active", true)
    .order("price_egp", { ascending: true });

  if (error) throw error;
  return data;
}

export async function generateSerials(planId: string, quantity: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!admin) throw new Error("Admin not found");

  const serials = Array.from({ length: quantity }, () => ({
    code: generateSerialCode(),
    plan_id: planId,
    status: "unused" as const,
    created_by: admin.id,
  }));

  const { data, error } = await supabase
    .from("clinic_serials")
    .insert(serials)
    .select("code");

  if (error) throw error;
  return data;
}

export async function cancelSerial(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("clinic_serials")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("status", "unused");

  if (error) throw error;
}
