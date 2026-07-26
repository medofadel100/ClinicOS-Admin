"use client";

import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";

type Payment = {
  id: string;
  clinic_id: string;
  amount_egp: number;
  payment_method: string;
  status: string;
  paid_at: string;
  reference_note: string | null;
  clinics: { name: string } | null;
  platform_admins: { full_name: string } | null;
};

export default function PaymentsClient({ payments }: { payments: Payment[] }) {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("globalPaymentsLedger")}</h1>
        <p className="text-slate-600">{t("masterRecordPayments")}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold">{t("allPayments")}</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("clinic")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("amountEGPLabel")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("methodLabel")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("status")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("recordedByLabel")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("paidAt")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments?.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <Link href={`/clinics/${payment.clinic_id}`} className="hover:underline text-indigo-600">
                    {payment.clinics?.name}
                  </Link>
                  {payment.reference_note && <div className="text-xs text-slate-400 font-normal mt-0.5">{payment.reference_note}</div>}
                </td>
                <td className="px-6 py-4 font-bold">{payment.amount_egp}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 uppercase">
                    {payment.payment_method.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    payment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {payment.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">{payment.platform_admins?.full_name}</td>
                <td className="px-6 py-4">{new Date(payment.paid_at).toLocaleString()}</td>
              </tr>
            ))}
            {!payments?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  {t("noPaymentsRecordedYet")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
