import { createClient } from "@/lib/supabase/server";
import PaymentsClient from "./_components/payments-client";

export default async function PaymentsPage() {
  const supabase = createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("*, clinics(name), platform_admins(full_name)")
    .order("paid_at", { ascending: false });

  return <PaymentsClient payments={payments ?? []} />;
}
