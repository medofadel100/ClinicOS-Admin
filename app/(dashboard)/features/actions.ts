"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addFeature(formData: FormData) {
  const code = formData.get("code") as string;
  const name_ar = formData.get("name_ar") as string;
  const name_en = formData.get("name_en") as string;
  const category = formData.get("category") as string;
  const base_price_egp = formData.get("base_price_egp") as string;
  
  if (!code || !name_ar || !name_en || !category) return;

  const supabase = createClient();
  await supabase.from("features").insert({
    code,
    name_ar,
    name_en,
    category,
    base_price_egp: base_price_egp ? parseFloat(base_price_egp) : null,
    is_active: true,
  });
  
  revalidatePath("/features");
}

export async function updateFeature(id: string, formData: FormData) {
  const name_ar = formData.get("name_ar") as string;
  const name_en = formData.get("name_en") as string;
  const category = formData.get("category") as string;
  const base_price_egp = formData.get("base_price_egp") as string;
  const description_en = formData.get("description_en") as string;
  const description_ar = formData.get("description_ar") as string;
  const is_active = formData.get("is_active") === "true";
  
  if (!name_ar || !name_en || !category) return { error: "Invalid data" };

  const supabase = createClient();
  const { error } = await supabase.from("features").update({
    name_ar,
    name_en,
    category,
    description_en: description_en || null,
    description_ar: description_ar || null,
    base_price_egp: base_price_egp ? parseFloat(base_price_egp) : null,
    is_active,
  }).eq("id", id);
  
  if (error) return { error: error.message };
  
  revalidatePath("/features");
  return { success: true };
}
