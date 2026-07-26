"use client";

import { useLanguage } from "@/lib/i18n/context";
import { updateRequestStatus } from "../actions";
import { useTransition } from "react";

type UpgradeRequest = {
  id: string;
  requested_by_name: string | null;
  message: string | null;
  status: string;
  created_at: string;
  clinics: { name: string } | null;
  features: { name_en: string; name_ar: string } | null;
};

export default function UpgradesClient({
  requests,
  activeStatus,
}: {
  requests: UpgradeRequest[];
  activeStatus: string;
}) {
  const { t } = useLanguage();
  const [, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateRequestStatus(formData);
    });
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t("upgradeRequests")}</h1>
        <p className="text-slate-600">{t("reviewRequests")}</p>
      </div>

      <div className="flex border-b border-slate-200">
        <a
          href="?status=open"
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeStatus === "open"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          {t("openRequests")}
        </a>
        <a
          href="?status=contacted"
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeStatus === "contacted"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          {t("contacted")}
        </a>
        <a
          href="?status=resolved"
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeStatus === "resolved"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          {t("resolved")}
        </a>
      </div>

      <div className="flex flex-col gap-4">
        {requests?.map((req) => {
          const clinicData = req.clinics as { name: string } | null;
          const featureData = req.features as { name_en: string; name_ar: string } | null;

          return (
            <div key={req.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-slate-900">
                    {clinicData ? clinicData.name : t("unknownClinic")}
                  </h3>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono">
                    {t("lockedFeature")} {featureData ? featureData.name_en : t("generalUpgrade")}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                  {req.message || t("noMessageProvided")}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{t("requestedBy")} <strong className="text-slate-600">{req.requested_by_name || t("unknown")}</strong></span>
                  <span>•</span>
                  <span>{t("date")}: {new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <form action={handleSubmit} className="flex items-center gap-2">
                <input type="hidden" name="request_id" value={req.id} />
                <select
                  name="status"
                  defaultValue={req.status}
                  className="border border-slate-200 rounded px-2 py-1.5 text-sm bg-slate-50 outline-none focus:border-slate-400"
                >
                  <option value="open">{t("open")}</option>
                  <option value="contacted">{t("contacted")}</option>
                  <option value="resolved">{t("resolved")}</option>
                </select>
                <button type="submit" className="bg-slate-900 text-white text-xs px-3 py-2 rounded font-medium hover:bg-slate-800 transition-colors">
                  {t("update")}
                </button>
              </form>
            </div>
          );
        })}
        {!requests?.length && (
          <div className="bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            {t("noUpgradeRequests")}
          </div>
        )}
      </div>
    </div>
  );
}
