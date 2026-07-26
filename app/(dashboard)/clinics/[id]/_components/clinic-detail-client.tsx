"use client";

import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";
import { ChangePlanForm } from "./change-plan-form";
import { ClinicStatusActions } from "./clinic-status-actions";
import { LicenseManager } from "./license-manager";

type Plan = { id: string; name_en: string; price_egp: number };
type Subscription = {
  id: string;
  status: string;
  plan_id: string;
  price_locked_egp: number;
  current_period_start: string;
  current_period_end: string;
  trial_ends_at: string | null;
  plans: { name_en: string } | null;
};
type Override = {
  id: string;
  override_type: string;
  price_addon_egp: number | null;
  expires_at: string | null;
  note: string | null;
  features: { name_en: string } | null;
  platform_admins: { full_name: string } | null;
};
type Feature = { id: string; name_en: string; base_price_egp: number | null; price_addon_egp?: number | null; code?: string };
type Payment = {
  id: string;
  amount_egp: number;
  payment_method: string;
  status: string;
  reference_note: string | null;
  paid_at: string;
  platform_admins: { full_name: string } | null;
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
  license_activations: {
    id: string;
    hardware_fingerprint: string;
    device_label: string | null;
    activated_at: string;
    deactivated_at: string | null;
  }[];
};

export default function ClinicDetailClient({
  clinic,
  clinicId,
  subscriptions,
  plans,
  overrides,
  features,
  entitlements,
  payments,
  license,
  hasOfflineAccess,
  onCreateOverride,
  onDeleteOverride,
  onRecordPayment,
}: {
  clinic: {
    id: string;
    name: string;
    status: string;
    created_at: string;
    owner_full_name: string;
    owner_email: string;
    owner_phone: string;
    clinic_types: { name_en: string } | null;
  };
  clinicId: string;
  subscriptions: Subscription[];
  plans: Plan[];
  overrides: Override[];
  features: Feature[];
  entitlements: Feature[];
  payments: Payment[];
  license: ClinicLicense | null;
  hasOfflineAccess: boolean;
  onCreateOverride: (formData: FormData) => Promise<void>;
  onDeleteOverride: (overrideId: string) => Promise<void>;
  onRecordPayment: (formData: FormData) => Promise<void>;
}) {
  const { t } = useLanguage();

  const activeSub = subscriptions.find(s => s.status === 'active' || s.status === 'trial');
  const pastSubs = subscriptions.filter(s => s !== activeSub);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/clinics" className="text-sm text-slate-500 hover:text-slate-900">&larr; {t("backToClinics")}</Link>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">{clinic.name}</h1>
          <p className="text-slate-600">{clinic.clinic_types?.name_en} • {t("created")} {new Date(clinic.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            clinic.status === 'active' ? 'bg-green-100 text-green-700' : 
            clinic.status === 'trial' ? 'bg-blue-100 text-blue-700' : 
            clinic.status === 'suspended' ? 'bg-amber-100 text-amber-700' : 
            clinic.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
            'bg-slate-100 text-slate-700'
          }`}>
            {clinic.status.toUpperCase()}
          </span>
          <div className="mt-3 flex justify-end">
            <ClinicStatusActions clinicId={clinic.id} currentStatus={clinic.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">{t("ownerContact")}</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <div className="text-slate-500">{t("fullName")}</div>
              <div className="font-medium">{clinic.owner_full_name}</div>
            </div>
            <div>
              <div className="text-slate-500">{t("email")}</div>
              <div className="font-medium">{clinic.owner_email}</div>
            </div>
            <div>
              <div className="text-slate-500">{t("phone")}</div>
              <div className="font-medium">{clinic.owner_phone}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">{t("activeSubscription")}</h2>
          {activeSub ? (
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <div className="text-slate-500">{t("plan")}</div>
                  <div className="font-bold text-lg">{activeSub.plans?.name_en}</div>
                </div>
                <div>
                  <div className="text-slate-500">{t("lockedPrice")}</div>
                  <div className="font-medium text-slate-900">{activeSub.price_locked_egp} EGP</div>
                </div>
                <div>
                  <div className="text-slate-500">{t("period")}</div>
                  <div className="font-medium">
                    {new Date(activeSub.current_period_start).toLocaleDateString()} &mdash; {new Date(activeSub.current_period_end).toLocaleDateString()}
                  </div>
                </div>
                {activeSub.status === 'trial' && activeSub.trial_ends_at && (
                  <div>
                    <div className="text-slate-500">{t("trialEndsAt")}</div>
                    <div className="font-medium text-blue-600">{new Date(activeSub.trial_ends_at).toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 min-w-[250px]">
                <h3 className="font-semibold text-sm mb-3">{t("changePlan")}</h3>
                <ChangePlanForm
                  clinicId={clinicId}
                  plans={plans}
                  currentPlanId={activeSub.plan_id}
                />
              </div>
            </div>
          ) : (
            <div className="text-slate-500 italic">{t("noActiveSubscription")}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold">{t("effectiveEntitlements")}</h2>
            <p className="text-xs text-slate-500 mt-1">{t("computedFromPlan")}</p>
          </div>
          <div className="p-6 flex-1">
            {entitlements.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {entitlements.map(feature => (
                  <li key={feature.id} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="text-green-500">✓</span> {feature.name_en}
                    {feature.price_addon_egp && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        +{feature.price_addon_egp} EGP {t("addonPrice")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-500 italic text-sm">{t("noActiveFeatures")}</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold">{t("addFeatureOverride")}</h2>
            <p className="text-xs text-slate-500 mt-1">{t("grantRevokeDesc")}</p>
          </div>
          <div className="p-6 flex-1">
            <form action={onCreateOverride} className="flex flex-col gap-4">
              <input type="hidden" name="clinic_id" value={clinicId} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">{t("typeLabel")}</label>
                  <select name="override_type" required className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm bg-white">
                    <option value="grant">{t("grant")}</option>
                    <option value="revoke">{t("revoke")}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">{t("featureLabel")}</label>
                  <select name="feature_id" required className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm bg-white">
                    <option value="">{t("selectFeature")}</option>
                    {features?.map(f => (
                      <option key={f.id} value={f.id}>{f.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">{t("addOnPrice")}</label>
                  <input type="number" step="0.01" name="price_addon_egp" placeholder={t("optional")} className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">{t("expiresAt")}</label>
                  <input type="datetime-local" name="expires_at" className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm" />
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">{t("noteLabel")}</label>
                <input name="note" placeholder={t("reasonForOverride")} className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm" />
              </div>

              <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 mt-2">
                {t("saveOverride")}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">{t("activeHistoricalOverrides")}</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("featureLabel")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("typeLabel")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("addonPriceLabel")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("grantedBy")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("expires")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700 text-right">{t("action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {overrides?.map((override) => {
              const isExpired = override.expires_at && new Date(override.expires_at) < new Date();
              return (
                <tr key={override.id} className={`hover:bg-slate-50 ${isExpired ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {override.features?.name_en}
                    {override.note && <div className="text-xs text-slate-400 font-normal mt-0.5">{override.note}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${override.override_type === 'grant' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {override.override_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">{override.price_addon_egp ? `${override.price_addon_egp} EGP` : '-'}</td>
                  <td className="px-6 py-4">{override.platform_admins?.full_name}</td>
                  <td className="px-6 py-4">
                    {override.expires_at ? new Date(override.expires_at).toLocaleString() : t("never")}
                    {isExpired && <span className="text-red-500 ml-2 font-semibold">{t("expired")}</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={async () => { await onDeleteOverride(override.id); }}>
                      <button type="submit" className="text-red-600 hover:text-red-800 font-medium">{t("delete")}</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {!overrides?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  {t("noFeatureOverrides")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-2">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{t("paymentsLedger")}</h2>
            <p className="text-xs text-slate-500 mt-1">{t("recordViewPayments")}</p>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <form action={onRecordPayment} className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <input type="hidden" name="clinic_id" value={clinicId} />
            <input type="hidden" name="subscription_id" value={activeSub?.id || ""} />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">{t("amountEGP")}</label>
              <input type="number" step="0.01" name="amount_egp" required className="border border-slate-300 rounded-md px-3 py-1.5 text-sm" />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">{t("method")}</label>
              <select name="payment_method" required className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white">
                <option value="bank_transfer">{t("bankTransfer")}</option>
                <option value="cash">{t("cash")}</option>
                <option value="vodafone_cash">{t("vodafoneCash")}</option>
                <option value="instapay">{t("instapay")}</option>
                <option value="other">{t("other")}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">{t("status")}</label>
              <select name="status" required className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white">
                <option value="confirmed">{t("confirmed")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="failed">{t("failed")}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">{t("referenceNote")}</label>
              <input type="text" name="reference_note" placeholder={t("optional")} className="border border-slate-300 rounded-md px-3 py-1.5 text-sm" />
            </div>

            <button type="submit" className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-green-700">
              {t("recordPayment")}
            </button>
          </form>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("amount")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("method")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("status")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("referenceNote")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("recordedBy")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("date")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments?.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold">{payment.amount_egp} EGP</td>
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
                <td className="px-6 py-4">{payment.reference_note || '-'}</td>
                <td className="px-6 py-4">{payment.platform_admins?.full_name}</td>
                <td className="px-6 py-4">{new Date(payment.paid_at).toLocaleString()}</td>
              </tr>
            ))}
            {!payments?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  {t("noPaymentsRecordedClinic")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">{t("subscriptionHistory")}</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("plan")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("status")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("lockedPriceLabel")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("periodStart")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("periodEnd")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pastSubs.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 opacity-70">
                <td className="px-6 py-4 font-medium text-slate-900">{sub.plans?.name_en}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                    {sub.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">{sub.price_locked_egp} EGP</td>
                <td className="px-6 py-4">{new Date(sub.current_period_start).toLocaleDateString()}</td>
                <td className="px-6 py-4">{new Date(sub.current_period_end).toLocaleDateString()}</td>
              </tr>
            ))}
            {!pastSubs.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  {t("noSubscriptionsFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LicenseManager clinicId={clinicId} license={license} hasOfflineAccess={hasOfflineAccess} />
    </div>
  );
}
