"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPlan(formData: FormData) {
  const code = formData.get("code") as string;
  const name_ar = formData.get("name_ar") as string;
  const name_en = formData.get("name_en") as string;
  const price_egp = parseFloat(formData.get("price_egp") as string);
  const billing_cycle = formData.get("billing_cycle") as "monthly" | "yearly";
  
  if (!code || !name_ar || !name_en || isNaN(price_egp)) return;

  const supabase = createClient();
  await supabase.from("plans").insert({
    code,
    name_ar,
    name_en,
    price_egp,
    billing_cycle,
    is_active: true,
  });
  
  revalidatePath("/plans");
}

export async function updatePlan(id: string, formData: FormData) {
  const name_ar = formData.get("name_ar") as string;
  const name_en = formData.get("name_en") as string;
  const price_egp = parseFloat(formData.get("price_egp") as string);
  const billing_cycle = formData.get("billing_cycle") as "monthly" | "yearly";
  const is_active = formData.get("is_active") === "true";
  
  if (!name_ar || !name_en || isNaN(price_egp)) return { error: "Invalid data" };

  const supabase = createClient();
  const { error } = await supabase.from("plans").update({
    name_ar,
    name_en,
    price_egp,
    billing_cycle,
    is_active,
  }).eq("id", id);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/plans");
  return { success: true };
}
