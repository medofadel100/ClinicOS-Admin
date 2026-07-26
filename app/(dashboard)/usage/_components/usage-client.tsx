"use client";

import { useLanguage } from "@/lib/i18n/context";

type UsageLog = {
  id: string;
  quantity: number;
  usage_type: string;
  period_month: string;
  clinics: { id: string; name: string } | null;
};

type Aggregated = Record<string, Record<string, number>>;

export default function UsageClient({
  aggregated,
  usageLogs,
}: {
  aggregated: Aggregated;
  usageLogs: UsageLog[];
}) {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t("usageReports")}</h1>
        <p className="text-slate-600">{t("trackUsage")}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">{t("clinicConsumptionSummary")}</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("clinicNameLabel")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("aiTokens")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("whatsappMessages")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("smsSent")}</th>
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
                  {t("noUsageData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">{t("recentRawLogs")}</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("clinic")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("type")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("quantity")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("billingPeriod")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usageLogs?.slice(0, 15).map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {log.clinics ? log.clinics.name : t("unknownClinic")}
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
            ))}
            {!usageLogs?.length && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  {t("noUsageLogs")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
