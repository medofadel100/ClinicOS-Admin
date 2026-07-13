"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const fullName = formData.get("full_name") as string;
  const authUserId = formData.get("auth_user_id") as string;

  if (!fullName || !authUserId) {
    return { error: "Missing required fields" };
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("platform_admins")
    .update({ full_name: fullName })
    .eq("auth_user_id", authUserId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!password || !confirmPassword) {
    return { error: "Missing required fields" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
