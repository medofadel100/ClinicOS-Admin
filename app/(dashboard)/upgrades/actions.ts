"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateRequestStatus(formData: FormData) {
  const requestId = formData.get("request_id") as string;
  const status = formData.get("status") as "open" | "contacted" | "resolved";

  if (!requestId || !status) {
    return { error: "Missing required fields" };
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("upgrade_requests")
    .update({ status })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/upgrades");
  return { success: true };
}
