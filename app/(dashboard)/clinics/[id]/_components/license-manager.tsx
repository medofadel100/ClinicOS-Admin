"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { suspendLicense, revokeLicense, activateLicense, regenerateLicense, deactivateDevice, updateMaxActivations } from "../license-actions";
import { useLanguage } from "@/lib/i18n/context";

type LicenseActivation = {
  id: string;
  hardware_fingerprint: string;
  device_label: string | null;
  activated_at: string;
  deactivated_at: string | null;
};

type ClinicLicense = {
  id: string;
  serial_code: string;
  signed_payload: string;
  status: string;
  issued_at: string;
  expires_at: string;
  max_activations: number;
  activation_count: number;
  license_activations: LicenseActivation[];
};

export function LicenseManager({ clinicId, license, hasOfflineAccess = false }: { clinicId: string, license: ClinicLicense | null, hasOfflineAccess?: boolean }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [isEditingMax, setIsEditingMax] = useState(false);

  const handleForceGenerate = () => {
    startTransition(async () => {
      try {
        const res = await regenerateLicense(clinicId) as { error?: string, success?: boolean };
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success(t("payloadRegenerated"));
          router.refresh();
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("actionFailed"));
      }
    });
  };

  if (!license) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col p-6">
        <h2 className="text-lg font-semibold mb-2">{t("offlineLicense")}</h2>
        {!hasOfflineAccess ? (
          <p className="text-red-500 italic text-sm mb-4">{t("offlineDesc")}</p>
        ) : (
          <p className="text-slate-500 italic text-sm mb-4">{t("noLicenseYet")}</p>
        )}
        <button 
          onClick={handleForceGenerate}
          disabled={isPending || !hasOfflineAccess}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 w-fit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? t("generating") : t("forceGenerate")}
        </button>
      </div>
    );
  }

  const handleAction = (action: (clinicId: string) => Promise<unknown>, successMessage: string) => {
    if (confirm(t("confirmAction"))) {
      startTransition(async () => {
        try {
          const res = await action(clinicId) as { error?: string, success?: boolean };
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success(successMessage);
            router.refresh();
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : t("actionFailed"));
        }
      });
    }
  };

  const handleDeactivate = (activationId: string) => {
    if (confirm(t("deactivateDevice"))) {
      startTransition(async () => {
        try {
          const res = await deactivateDevice(activationId, clinicId) as { error?: string, success?: boolean };
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success(t("deviceDeactivated"));
            router.refresh();
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : t("deactivateFailed"));
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{t("offlineLicense")}</h2>
          <p className="text-xs text-slate-500 mt-1">{t("manageDesktop")}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
          license.status === 'active' ? 'bg-green-100 text-green-700' : 
          license.status === 'suspended' ? 'bg-amber-100 text-amber-700' : 
          'bg-red-100 text-red-700'
        }`}>
          {license.status.toUpperCase()}
        </span>
      </div>

      <div className="p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <div className="text-sm text-slate-500">{t("serialCode")}</div>
            <div className="font-mono bg-slate-100 px-3 py-1.5 rounded-md mt-1 w-fit text-slate-800">
              {license.serial_code}
            </div>
          </div>
          <div className="flex gap-8">
            <div>
              <div className="text-sm text-slate-500">{t("issuedAt")}</div>
              <div className="font-medium text-sm mt-1">{new Date(license.issued_at).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">{t("expiresAtLabel")}</div>
              <div className="font-medium text-sm mt-1">{new Date(license.expires_at).toLocaleDateString()}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">{t("activations")}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-medium text-sm">{license.activation_count} / </span>
              {isEditingMax ? (
                <form 
                  action={(formData) => {
                    const max = parseInt(formData.get("max") as string, 10);
                    if (!isNaN(max) && max >= license.activation_count) {
                      startTransition(() => {
                        updateMaxActivations(clinicId, max).then(() => setIsEditingMax(false));
                      });
                    } else {
                      alert(t("maxActivationsError"));
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  <input 
                    name="max" 
                    type="number" 
                    defaultValue={license.max_activations} 
                    min={license.activation_count}
                    className="w-16 border border-slate-300 rounded px-1 text-sm py-0.5 outline-none"
                  />
                  <button type="submit" disabled={isPending} className="text-blue-600 text-xs font-medium hover:underline">{t("saveBtn")}</button>
                  <button type="button" onClick={() => setIsEditingMax(false)} disabled={isPending} className="text-slate-500 text-xs hover:underline">{t("cancelBtn")}</button>
                </form>
              ) : (
                <>
                  <span className="font-medium text-sm">{license.max_activations} {t("used")}</span>
                  <button onClick={() => setIsEditingMax(true)} className="text-blue-600 text-xs hover:underline">{t("edit")}</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px] border-l border-slate-100 pl-6">
          <h3 className="font-semibold text-sm mb-1">{t("actions")}</h3>
          {license.status === "active" ? (
            <button 
              onClick={() => handleAction(suspendLicense, t("licenseSuspended"))} 
              disabled={isPending}
              className="text-left text-sm text-amber-600 font-medium hover:underline"
            >
              {t("suspendLicense")}
            </button>
          ) : (
            <button 
              onClick={() => handleAction(activateLicense, t("licenseActivated"))} 
              disabled={isPending}
              className="text-left text-sm text-green-600 font-medium hover:underline"
            >
              {t("activateLicense")}
            </button>
          )}
          <button 
            onClick={() => handleAction(revokeLicense, t("licenseRevoked"))} 
            disabled={isPending || license.status === "revoked"}
            className="text-left text-sm text-red-600 font-medium hover:underline disabled:opacity-50"
          >
            {t("revokeLicense")}
          </button>
          <button 
            onClick={() => handleAction(regenerateLicense, t("payloadRegenerated"))} 
            disabled={isPending}
            className="text-left text-sm text-blue-600 font-medium hover:underline mt-2"
          >
            {t("regeneratePayload")}
          </button>
          <button 
            onClick={() => {
              const blob = new Blob([license.signed_payload], { type: "text/plain;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `${license.serial_code}.clinicos`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }} 
            className="text-left text-sm text-indigo-600 font-medium hover:underline mt-2"
          >
            {t("downloadOffline")}
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <h3 className="px-6 py-3 font-semibold text-sm bg-slate-50 border-b border-slate-100">{t("activatedDevices")}</h3>
        {license.license_activations && license.license_activations.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500 bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-2 font-medium">{t("deviceLabel")}</th>
                <th className="px-6 py-2 font-medium">{t("fingerprint")}</th>
                <th className="px-6 py-2 font-medium">{t("activated")}</th>
                <th className="px-6 py-2 font-medium text-right">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {license.license_activations.map(act => (
                <tr key={act.id} className={act.deactivated_at ? "opacity-50" : ""}>
                  <td className="px-6 py-3">{act.device_label || "Unknown Device"}</td>
                  <td className="px-6 py-3 font-mono text-xs">{act.hardware_fingerprint.substring(0, 12)}...</td>
                  <td className="px-6 py-3">
                    {new Date(act.activated_at).toLocaleDateString()}
                    {act.deactivated_at && <span className="block text-xs text-red-500">{t("deactivated")} {new Date(act.deactivated_at).toLocaleDateString()}</span>}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {!act.deactivated_at && (
                      <button 
                        onClick={() => handleDeactivate(act.id)}
                        disabled={isPending}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        {t("deactivateBtn")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-sm text-slate-500 italic">{t("noDevicesActivated")}</div>
        )}
      </div>
    </div>
  );
}
