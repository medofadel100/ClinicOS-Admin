"use client";

import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";

type ClinicType = { id: string; name_en: string };
type Plan = { id: string; name_en: string; price_egp: number };
type Clinic = {
  id: string;
  name: string;
  status: string;
  owner_full_name: string;
  owner_email: string;
  clinic_types: { name_en: string } | null;
};

export default function ClinicsListClient({
  clinics,
  types,
  plans,
  onCreateClinic,
}: {
  clinics: Clinic[];
  types: ClinicType[];
  plans: Plan[];
  onCreateClinic: (formData: FormData) => Promise<void>;
}) {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t("clinics")}</h1>
        <p className="text-slate-600">{t("storageDashboardDesc")}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">{t("registerNewClinic")}</h2>
        <form action={onCreateClinic} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("clinicName")}</label>
            <input name="name" required placeholder="Care Clinic" className="border border-slate-300 rounded-md px-3 py-2 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("clinicType")}</label>
            <select name="clinic_type_id" required className="border border-slate-300 rounded-md px-3 py-2 outline-none bg-white">
              <option value="">{t("selectType")}</option>
              {types?.map((tp) => (
                <option key={tp.id} value={tp.id}>{tp.name_en}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("ownerFullName")}</label>
            <input name="owner_full_name" required placeholder="Dr. Ahmed" className="border border-slate-300 rounded-md px-3 py-2 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("ownerEmail")}</label>
            <input name="owner_email" type="email" required placeholder="ahmed@example.com" className="border border-slate-300 rounded-md px-3 py-2 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("ownerPhone")}</label>
            <input name="owner_phone" required placeholder="01000000000" className="border border-slate-300 rounded-md px-3 py-2 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("initialStatus")}</label>
            <select name="status" required className="border border-slate-300 rounded-md px-3 py-2 outline-none bg-white">
              <option value="trial">{t("trial7Days")}</option>
              <option value="active">{t("activePaid")}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("subscriptionPlan")}</label>
            <select name="plan_id" required className="border border-slate-300 rounded-md px-3 py-2 outline-none bg-white">
              <option value="">{t("selectPlan")}</option>
              {plans?.map((p) => (
                <option key={p.id} value={p.id}>{p.name_en} - {p.price_egp} EGP</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("discountCode")}</label>
            <input name="discount_code" placeholder={t("discountCodePlaceholder")} className="border border-slate-300 rounded-md px-3 py-2 outline-none uppercase" />
          </div>
          <div className="md:col-span-2 lg:col-span-3 mt-2">
            <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800">
              {t("createClinicBtn")}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("name")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("type")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("owner")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("status")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clinics?.map((clinic) => (
              <tr key={clinic.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{clinic.name}</td>
                <td className="px-6 py-4 text-slate-600">{clinic.clinic_types?.name_en}</td>
                <td className="px-6 py-4 text-slate-600">
                  <div>{clinic.owner_full_name}</div>
                  <div className="text-xs text-slate-400">{clinic.owner_email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    clinic.status === 'active' ? 'bg-green-100 text-green-700' : 
                    clinic.status === 'trial' ? 'bg-blue-100 text-blue-700' : 
                    clinic.status === 'past_due' ? 'bg-orange-100 text-orange-700' : 
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {clinic.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/clinics/${clinic.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                    {t("view")} &rarr;
                  </Link>
                </td>
              </tr>
            ))}
            {!clinics?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  {t("noClinicsFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
