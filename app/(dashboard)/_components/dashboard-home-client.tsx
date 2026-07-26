"use client";

import Link from "next/link";
import { AlertCircle, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface Admin {
  full_name: string;
  role: string;
}

interface Clinic {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount_egp: number;
  status: string;
  paid_at: string;
  clinics: { name: string } | null;
}

interface ExpiringSubscription {
  id: string;
  clinic_id: string;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  pending_confirmation_expires_at: string | null;
  clinics: { name: string; owner_email: string } | null;
}

interface PastDueClinic {
  id: string;
  name: string;
  owner_email: string;
}

interface DashboardHomeClientProps {
  admin: Admin | null;
  totalClinics: number;
  activeClinics: number;
  activeSubscriptions: number;
  totalRevenue: number;
  recentClinics: Clinic[];
  recentPayments: Payment[];
  expiringSubscriptions: ExpiringSubscription[];
  pastDueClinics: PastDueClinic[];
}

export default function DashboardHomeClient({
  admin,
  totalClinics,
  activeClinics,
  activeSubscriptions,
  totalRevenue,
  recentClinics,
  recentPayments,
  expiringSubscriptions,
  pastDueClinics,
}: DashboardHomeClientProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">{t("overview")}</h1>
          <p className="text-slate-600">{t("welcomeBack")} {admin?.full_name}. {t("happeningToday")}</p>
        </div>
        <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200">
          {t("role")} <span className="capitalize">{admin?.role.replace("_", " ")}</span>
        </div>
      </div>

      {(expiringSubscriptions?.length || pastDueClinics?.length) ? (
        <div className="flex flex-col gap-4">
          {pastDueClinics && pastDueClinics.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold">{t("pastDueClinics")}</h3>
              </div>
              <ul className="text-sm text-red-900 space-y-1">
                {pastDueClinics.map((c) => (
                  <li key={c.id}>
                    <Link href={`/clinics/${c.id}`} className="hover:underline font-medium">{c.name}</Link>
                    {" "}({c.owner_email}) {t("isPastDue")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {expiringSubscriptions && expiringSubscriptions.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                <Clock className="w-5 h-5" />
                <h3 className="font-bold">{t("expiring7Days")}</h3>
              </div>
              <ul className="text-sm text-amber-900 space-y-1">
                {expiringSubscriptions.map((sub) => {
                  const dateToUse =
                    sub.status === "trial"
                      ? sub.trial_ends_at
                      : sub.status === "pending_confirmation"
                        ? sub.pending_confirmation_expires_at
                        : sub.current_period_end;
                  const dateStr = dateToUse
                    ? new Date(dateToUse).toLocaleDateString()
                    : t("unknown");
                  const clinics = sub.clinics as unknown as {
                    name: string;
                    owner_email: string;
                  };
                  const statusLabel =
                    sub.status === "trial"
                      ? t("trial")
                      : sub.status === "pending_confirmation"
                        ? t("pendingConfirmation")
                        : t("subscription");
                  return (
                    <li key={sub.id}>
                      <Link
                        href={`/clinics/${sub.clinic_id}`}
                        className="hover:underline font-medium"
                      >
                        {clinics?.name}
                      </Link>
                      {" "}({clinics?.owner_email}) - {statusLabel} {t("endsOn")} {dateStr}.
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-1">{t("totalClinics")}</h3>
          <div className="text-3xl font-bold">{totalClinics || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-1">{t("activeClinics")}</h3>
          <div className="text-3xl font-bold text-green-600">{activeClinics || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-1">{t("activeSubscriptions")}</h3>
          <div className="text-3xl font-bold text-indigo-600">{activeSubscriptions || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-1">{t("totalRevenue")}</h3>
          <div className="text-3xl font-bold text-slate-900">{totalRevenue.toLocaleString()} EGP</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold">{t("recentClinics")}</h2>
            <Link href="/clinics" className="text-sm text-indigo-600 hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentClinics?.map((clinic) => (
              <div
                key={clinic.id}
                className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <div>
                  <Link
                    href={`/clinics/${clinic.id}`}
                    className="font-medium text-slate-900 hover:underline block"
                  >
                    {clinic.name}
                  </Link>
                  <div className="text-xs text-slate-500 mt-1">
                    {t("joined")} {new Date(clinic.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    clinic.status === "active"
                      ? "bg-green-100 text-green-700"
                      : clinic.status === "trial"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {t(clinic.status as "active" | "trial")}
                </span>
              </div>
            ))}
            {!recentClinics?.length && (
              <div className="p-8 text-center text-slate-500 text-sm">
                {t("noClinicsRegistered")}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold">{t("recentPayments")}</h2>
            <Link href="/payments" className="text-sm text-indigo-600 hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPayments?.map((payment) => (
              <div
                key={payment.id}
                className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="font-medium text-slate-900">{payment.amount_egp} EGP</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {(payment.clinics as unknown as { name: string })?.name} •{" "}
                    {new Date(payment.paid_at).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    payment.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : payment.status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {t(payment.status as "confirmed" | "failed" | "pending")}
                </span>
              </div>
            ))}
            {!recentPayments?.length && (
              <div className="p-8 text-center text-slate-500 text-sm">
                {t("noPaymentsRecorded")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
