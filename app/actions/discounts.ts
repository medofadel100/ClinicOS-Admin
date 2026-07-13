"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database";

type DiscountCodeInsert = Database["public"]["Tables"]["discount_codes"]["Insert"];

export async function getDiscountCodes() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createDiscountCode(data: Omit<DiscountCodeInsert, "created_by">) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: admin } = await supabase.from("platform_admins").select("id").eq("auth_user_id", user.id).single();
  if (!admin) throw new Error("Admin not found");

  const { error } = await supabase
    .from("discount_codes")
    .insert({
      ...data,
      created_by: admin.id,
    });

  if (error) throw new Error(error.message);

  revalidatePath("/discounts");
}

export async function toggleDiscountCodeActive(id: string, is_active: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("discount_codes")
    .update({ is_active })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/discounts");
}

export async function validateDiscountCodeServer(codeStr: string, context: "new_subscription" | "renewal") {
  const supabase = createClient();
  const { data: code, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", codeStr)
    .single();

  if (error || !code) {
    return { isValid: false, error: "Invalid discount code." };
  }

  const { validateDiscountCode } = await import("@/lib/discounts");
  const result = validateDiscountCode(code, context);
  
  if (!result.isValid) return result;
  
  return { isValid: true, code };
}
