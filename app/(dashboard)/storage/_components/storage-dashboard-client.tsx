"use client";

import { useLanguage } from "@/lib/i18n/context";
import type { StorageOverview, StorageOption } from "../actions";
import StorageTable from "./storage-table";

export default function StorageDashboardClient({
  overview,
  storageOptions,
}: {
  overview: StorageOverview;
  storageOptions: StorageOption[];
}) {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t("storageDashboard")}</h1>
        <p className="text-slate-600">{t("storageDashboardDesc")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            {t("totalUsed")}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {overview.totals.total_used_gb}{" "}
            <span className="text-sm font-normal text-slate-500">
              / {overview.totals.total_quota_gb} GB
            </span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            {t("totalClinics")}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {overview.totals.total_clinics}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            {t("warnings")}
          </p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {overview.totals.clinics_warning}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            {t("critical")}
          </p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {overview.totals.clinics_critical}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            {t("full")}
          </p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {overview.totals.clinics_full}
          </p>
        </div>
      </div>

      <StorageTable clinics={overview.clinics} storageOptions={storageOptions} />
    </div>
  );
}
