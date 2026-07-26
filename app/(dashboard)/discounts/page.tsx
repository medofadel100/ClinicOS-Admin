import { getDiscountCodes } from "@/app/actions/discounts";
import { createClient } from "@/lib/supabase/server";
import DiscountsListClient from "./_components/discounts-list-client";

export default async function DiscountsPage() {
  const codes = await getDiscountCodes();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admin } = await supabase.from("platform_admins").select("role").eq("auth_user_id", user?.id || "").single();

  const canEdit = admin?.role === "super_admin" || admin?.role === "accountant";

  return <DiscountsListClient codes={codes} canEdit={canEdit} />;
}
