"use client";

import { useState } from "react";
import { suspendClinic, cancelClinic, reactivateClinic } from "../../actions-status";
import { useLanguage } from "@/lib/i18n/context";

export function ClinicStatusActions({ clinicId, currentStatus }: { clinicId: string, currentStatus: string }) {
  const { t } = useLanguage();
  const [isConfirming, setIsConfirming] = useState<"suspend" | "cancel" | "reactivate" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction() {
    setLoading(true);
    let res;
    try {
      if (isConfirming === "suspend") res = await suspendClinic(clinicId);
      if (isConfirming === "cancel") res = await cancelClinic(clinicId);
      if (isConfirming === "reactivate") res = await reactivateClinic(clinicId);
      
      if (res?.error) {
        alert(res.error);
      }
    } finally {
      setLoading(false);
      setIsConfirming(null);
    }
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 bg-yellow-50 p-2 rounded-md border border-yellow-200 text-sm">
        <span className="font-medium text-yellow-800">
          {t("confirm")} {isConfirming}?
        </span>
        <button 
          onClick={handleAction} 
          disabled={loading}
          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "..." : t("ok")}
        </button>
        <button 
          onClick={() => setIsConfirming(null)} 
          disabled={loading}
          className="text-slate-600 px-2 py-1 rounded hover:bg-slate-200 disabled:opacity-50"
        >
          {t("cancel")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {(currentStatus === "active" || currentStatus === "trial" || currentStatus === "past_due") && (
        <>
          <button 
            onClick={() => setIsConfirming("suspend")}
            className="text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-md transition-colors"
          >
            {t("suspendLicense")}
          </button>
          <button 
            onClick={() => setIsConfirming("cancel")}
            className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
          >
            {t("cancel")}
          </button>
        </>
      )}
      {currentStatus === "suspended" && (
        <>
          <button 
            onClick={() => setIsConfirming("reactivate")}
            className="text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors"
          >
            {t("activate")}
          </button>
          <button 
            onClick={() => setIsConfirming("cancel")}
            className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
          >
            {t("cancel")}
          </button>
        </>
      )}
      {currentStatus === "cancelled" && (
        <span className="text-sm text-slate-500 italic">
          {t("noActiveSubscription")}
        </span>
      )}
    </div>
  );
}
