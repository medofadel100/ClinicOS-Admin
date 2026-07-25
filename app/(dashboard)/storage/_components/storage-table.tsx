"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import type { ClinicStorageInfo, StorageOption } from "../actions";
import IncreaseStorageModal from "./increase-storage-modal";

type FilterStatus = "all" | "warning" | "critical" | "full";

export default function StorageTable({
  clinics,
  storageOptions,
}: {
  clinics: ClinicStorageInfo[];
  storageOptions: StorageOption[];
}) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedClinic, setSelectedClinic] = useState<ClinicStorageInfo | null>(null);

  const filtered = filter === "all" ? clinics : clinics.filter((c) => c.status === filter);

  const filterCounts = {
    all: clinics.length,
    warning: clinics.filter((c) => c.status === "warning").length,
    critical: clinics.filter((c) => c.status === "critical").length,
    full: clinics.filter((c) => c.status === "full").length,
  };

  function getStatusBadge(status: ClinicStorageInfo["status"]) {
    switch (status) {
      case "full":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{t("filterFull")}</span>;
      case "critical":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">{t("critical")}</span>;
      case "warning":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">{t("filterWarning")}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">OK</span>;
    }
  }

  function getBarColor(percent: number) {
    if (percent >= 100) return "bg-red-500";
    if (percent >= 95) return "bg-orange-500";
    if (percent >= 80) return "bg-yellow-500";
    return "bg-green-500";
  }

  return (
    <>
      <div className="flex gap-2">
        {(["all", "warning", "critical", "full"] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? t("filterAll") : f === "warning" ? t("filterWarning") : f === "critical" ? t("filterCritical") : t("filterFull")} ({filterCounts[f]})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">{t("clinic")}</th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">{t("storageUsed")}</th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">{t("progress")}</th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">{t("files")}</th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">{t("status")}</th>
              <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((clinic) => (
              <tr key={clinic.clinic_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{clinic.clinic_name}</p>
                    <p className="text-xs text-slate-500">{clinic.owner_name}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-900">
                    {clinic.used_gb} GB <span className="text-slate-400 font-normal">/ {clinic.quota_gb} GB</span>
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getBarColor(clinic.percent_used)}`}
                        style={{ width: `${Math.min(clinic.percent_used, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 w-10 text-right">{clinic.percent_used}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{clinic.file_count}</span>
                </td>
                <td className="px-6 py-4">{getStatusBadge(clinic.status)}</td>
                <td className="px-6 py-4 text-right">
                  {clinic.status !== "normal" && (
                    <button
                      onClick={() => setSelectedClinic(clinic)}
                      className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-md font-medium hover:bg-slate-800 transition-colors"
                    >
                      {t("increase")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  {t("noClinicsMatchFilter")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedClinic && (
        <IncreaseStorageModal
          clinic={selectedClinic}
          storageOptions={storageOptions}
          onClose={() => setSelectedClinic(null)}
        />
      )}
    </>
  );
}
