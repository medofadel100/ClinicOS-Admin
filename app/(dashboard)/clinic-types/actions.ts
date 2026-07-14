"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addClinicType(formData: FormData) {
  const code = formData.get("code") as string;
  const name_ar = formData.get("name_ar") as string;
  const name_en = formData.get("name_en") as string;
  const description = formData.get("description") as string;
  
  if (!code || !name_ar || !name_en) return;

  const supabase = createClient();
  await supabase.from("clinic_types").insert({
    code,
    name_ar,
    name_en,
    description: description || null,
    is_active: true,
  });
  
  revalidatePath("/clinic-types");
}

export async function updateClinicType(id: string, formData: FormData) {
  const name_ar = formData.get("name_ar") as string;
  const name_en = formData.get("name_en") as string;
  const description = formData.get("description") as string;
  const is_active = formData.get("is_active") === "true";
  
  if (!name_ar || !name_en) return { error: "Invalid data" };

  const supabase = createClient();
  const { error } = await supabase.from("clinic_types").update({
    name_ar,
    name_en,
    description: description || null,
    is_active,
  }).eq("id", id);
  
  if (error) return { error: error.message };
  
  revalidatePath("/clinic-types");
  return { success: true };
}
