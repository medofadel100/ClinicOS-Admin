"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createAdmin(formData: FormData) {
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!fullName || !email || !password || !role) {
    return { error: "Missing required fields" };
  }

  try {
    const adminClient = createAdminClient();

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Failed to create user in Auth system" };
    }

    // 2. Insert into platform_admins
    const { error: dbError } = await adminClient
      .from("platform_admins")
      .insert({
        auth_user_id: authData.user.id,
        full_name: fullName,
        role: role,
      });

    if (dbError) {
      // Rollback Auth user if DB insert fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return { error: dbError.message };
    }

    revalidatePath("/admins");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "An unexpected error occurred" };
  }
}
