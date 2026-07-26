import { createClient } from "@/lib/supabase/server";
import UsageClient from "./_components/usage-client";

export default async function UsagePage() {
  const supabase = createClient();

  const { data: usageLogs, error } = await supabase
    .from("usage_logs")
    .select(`
      id,
      quantity,
      usage_type,
      period_month,
      clinics (
        id,
        name
      )
    `)
    .order("period_month", { ascending: false });

  if (error) {
    console.error("Error fetching usage:", error.message);
  }

  const aggregated: Record<string, Record<string, number>> = {};

  if (usageLogs) {
    for (const log of usageLogs) {
      const clinicsData = log.clinics as unknown as { name: string } | null;
      const clinicName = clinicsData ? clinicsData.name : "Unknown Clinic";
      if (!aggregated[clinicName]) {
        aggregated[clinicName] = { ai_tokens: 0, whatsapp_messages: 0, sms: 0 };
      }
      const type = log.usage_type as string;
      aggregated[clinicName][type] = (aggregated[clinicName][type] || 0) + Number(log.quantity);
    }
  }

  return <UsageClient aggregated={aggregated} usageLogs={usageLogs ?? []} />;
}
