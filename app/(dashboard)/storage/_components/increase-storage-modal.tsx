"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { increaseClinicStorage } from "../actions";
import type { ClinicStorageInfo, StorageOption } from "../actions";

export default function IncreaseStorageModal({
  clinic,
  storageOptions,
  onClose,
}: {
  clinic: ClinicStorageInfo;
  storageOptions: StorageOption[];
  onClose: () => void;
}) {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);
    setError(null);

    const result = await increaseClinicStorage(clinic.clinic_id, selected);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => onClose(), 1500);
    }
  }

  const currentQuotaGB = clinic.quota_gb;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{t("storageIncreased")}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {clinic.clinic_name} - {t("storageUpdated")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{t("increaseStorage")}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-slate-900">{clinic.clinic_name}</p>
              <p className="text-xs text-slate-500 mt-1">
                {t("currentUsage")} {clinic.used_gb} GB / {currentQuotaGB} GB ({clinic.percent_used}%)
              </p>
            </div>

            <p className="text-sm font-medium text-slate-700 mb-3">{t("selectStorageAddon")}</p>

            <div className="flex flex-col gap-2 mb-4">
              {storageOptions.map((option) => {
                const newTotalGB = Math.round(((currentQuotaGB * 1024 + option.mb) / 1024) * 100) / 100;
                const optionLabel = language === "ar" ? option.label_ar : option.label_en;
                return (
                  <label
                    key={option.code}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selected === option.code
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="storage_option"
                        value={option.code}
                        checked={selected === option.code}
                        onChange={() => setSelected(option.code)}
                        className="w-4 h-4 text-slate-900"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{optionLabel}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {t("newTotal")} {newTotalGB} GB
                    </span>
                  </label>
                );
              })}
            </div>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selected || loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("processing") : t("confirm")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
