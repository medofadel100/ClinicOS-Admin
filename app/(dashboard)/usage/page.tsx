import { createClient } from "@/lib/supabase/server";

export default async function UsagePage() {
  const supabase = createClient();

  // Fetch usage logs grouped by clinic and usage_type
  // PostgreSQL can do SUM queries easily.
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

  // Aggregate quantity by clinic name and usage_type for a cleaner report view
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

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Usage Reports</h1>
        <p className="text-slate-600">Track AI tokens, WhatsApp messages, and SMS consumption across all clinics.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Clinic Consumption Summary</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">Clinic Name</th>
              <th className="px-6 py-3 font-semibold text-slate-700">AI Tokens</th>
              <th className="px-6 py-3 font-semibold text-slate-700">WhatsApp Messages</th>
              <th className="px-6 py-3 font-semibold text-slate-700">SMS Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.keys(aggregated).map((clinicName) => (
              <tr key={clinicName} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{clinicName}</td>
                <td className="px-6 py-4 text-slate-600 font-mono">
                  {aggregated[clinicName].ai_tokens.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono">
                  {aggregated[clinicName].whatsapp_messages.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono">
                  {aggregated[clinicName].sms.toLocaleString()}
                </td>
              </tr>
            ))}
            {Object.keys(aggregated).length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No usage data recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Recent Raw Logs</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">Clinic</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Type</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Quantity</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Billing Period</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usageLogs?.slice(0, 15).map((log) => {
              const clinicsData = log.clinics as unknown as { name: string } | null;
              return (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {clinicsData ? clinicsData.name : "Unknown Clinic"}
                  </td>
                <td className="px-6 py-4 text-slate-600 capitalize">
                  {log.usage_type.replace("_", " ")}
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono">
                  {Number(log.quantity).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono">
                  {log.period_month}
                </td>
              </tr>
              );
            })}
            {!usageLogs?.length && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No usage logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
