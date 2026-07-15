"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { suspendLicense, revokeLicense, activateLicense, regenerateLicense, deactivateDevice, updateMaxActivations } from "../license-actions";

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
  const [isPending, startTransition] = useTransition();
  const [isEditingMax, setIsEditingMax] = useState(false);

  const handleForceGenerate = () => {
    startTransition(async () => {
      try {
        const res = await regenerateLicense(clinicId) as { error?: string, success?: boolean };
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("License generated successfully!");
          router.refresh();
        }
      } catch (err: any) {
        toast.error(err.message || "An unexpected error occurred");
      }
    });
  };

  if (!license) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col p-6">
        <h2 className="text-lg font-semibold mb-2">Offline License</h2>
        {!hasOfflineAccess ? (
          <p className="text-red-500 italic text-sm mb-4">This clinic's current subscription plan does not include Offline/Desktop access. Upgrade the plan or purchase the Offline Add-on to enable license generation.</p>
        ) : (
          <p className="text-slate-500 italic text-sm mb-4">No license has been issued for this clinic yet. It will be generated automatically when a subscription is created or renewed.</p>
        )}
        <button 
          onClick={handleForceGenerate}
          disabled={isPending || !hasOfflineAccess}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 w-fit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Generating..." : "Force Generate License"}
        </button>
      </div>
    );
  }

  const handleAction = (action: (clinicId: string) => Promise<unknown>, successMessage: string) => {
    if (confirm("Are you sure you want to perform this action?")) {
      startTransition(async () => {
        try {
          const res = await action(clinicId) as { error?: string, success?: boolean };
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success(successMessage);
            router.refresh();
          }
        } catch (err: any) {
          toast.error(err.message || "Action failed");
        }
      });
    }
  };

  const handleDeactivate = (activationId: string) => {
    if (confirm("Deactivate this device? It will free up an activation slot.")) {
      startTransition(async () => {
        try {
          const res = await deactivateDevice(activationId, clinicId) as { error?: string, success?: boolean };
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success("Device deactivated successfully");
            router.refresh();
          }
        } catch (err: any) {
          toast.error(err.message || "Failed to deactivate device");
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Offline License</h2>
          <p className="text-xs text-slate-500 mt-1">Manage desktop app activations and serials.</p>
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
            <div className="text-sm text-slate-500">Serial Code</div>
            <div className="font-mono bg-slate-100 px-3 py-1.5 rounded-md mt-1 w-fit text-slate-800">
              {license.serial_code}
            </div>
          </div>
          <div className="flex gap-8">
            <div>
              <div className="text-sm text-slate-500">Issued At</div>
              <div className="font-medium text-sm mt-1">{new Date(license.issued_at).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Expires At</div>
              <div className="font-medium text-sm mt-1">{new Date(license.expires_at).toLocaleDateString()}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Activations</div>
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
                      alert("Max activations must be a number greater than or equal to current usage.");
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
                  <button type="submit" disabled={isPending} className="text-blue-600 text-xs font-medium hover:underline">Save</button>
                  <button type="button" onClick={() => setIsEditingMax(false)} disabled={isPending} className="text-slate-500 text-xs hover:underline">Cancel</button>
                </form>
              ) : (
                <>
                  <span className="font-medium text-sm">{license.max_activations} used</span>
                  <button onClick={() => setIsEditingMax(true)} className="text-blue-600 text-xs hover:underline">Edit</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px] border-l border-slate-100 pl-6">
          <h3 className="font-semibold text-sm mb-1">Actions</h3>
          {license.status === "active" ? (
            <button 
              onClick={() => handleAction(suspendLicense, "License suspended")} 
              disabled={isPending}
              className="text-left text-sm text-amber-600 font-medium hover:underline"
            >
              Suspend License
            </button>
          ) : (
            <button 
              onClick={() => handleAction(activateLicense, "License activated")} 
              disabled={isPending}
              className="text-left text-sm text-green-600 font-medium hover:underline"
            >
              Activate License
            </button>
          )}
          <button 
            onClick={() => handleAction(revokeLicense, "License revoked")} 
            disabled={isPending || license.status === "revoked"}
            className="text-left text-sm text-red-600 font-medium hover:underline disabled:opacity-50"
          >
            Revoke License
          </button>
          <button 
            onClick={() => handleAction(regenerateLicense, "License payload regenerated")} 
            disabled={isPending}
            className="text-left text-sm text-blue-600 font-medium hover:underline mt-2"
          >
            Regenerate Payload
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
            Download Offline License
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <h3 className="px-6 py-3 font-semibold text-sm bg-slate-50 border-b border-slate-100">Activated Devices</h3>
        {license.license_activations && license.license_activations.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500 bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-2 font-medium">Device Label</th>
                <th className="px-6 py-2 font-medium">Fingerprint</th>
                <th className="px-6 py-2 font-medium">Activated</th>
                <th className="px-6 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {license.license_activations.map(act => (
                <tr key={act.id} className={act.deactivated_at ? "opacity-50" : ""}>
                  <td className="px-6 py-3">{act.device_label || "Unknown Device"}</td>
                  <td className="px-6 py-3 font-mono text-xs">{act.hardware_fingerprint.substring(0, 12)}...</td>
                  <td className="px-6 py-3">
                    {new Date(act.activated_at).toLocaleDateString()}
                    {act.deactivated_at && <span className="block text-xs text-red-500">Deactivated {new Date(act.deactivated_at).toLocaleDateString()}</span>}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {!act.deactivated_at && (
                      <button 
                        onClick={() => handleDeactivate(act.id)}
                        disabled={isPending}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-sm text-slate-500 italic">No devices have been activated yet.</div>
        )}
      </div>
    </div>
  );
}
