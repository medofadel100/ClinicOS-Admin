"use client";

import { useLanguage } from "@/lib/i18n/context";
import { addClinicType } from "../actions";
import { ClinicTypeRow } from "./clinic-type-row";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ClinicTypesClient({ clinicTypes }: { clinicTypes: any[] }) {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t("clinicTypes")}</h1>
        <p className="text-slate-600">{t("manageSpecialties")}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">{t("addNewType")}</h2>
        <form action={addClinicType} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("codeUnique")}</label>
            <input 
              name="code" 
              required 
              placeholder={t("codePlaceholder")}
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("nameEnglish")}</label>
            <input 
              name="name_en" 
              required 
              placeholder="Dental Clinic"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("nameArabic")}</label>
            <input 
              name="name_ar" 
              required 
              placeholder="عيادة أسنان"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 text-right"
              dir="rtl"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("descriptionOptional")}</label>
            <input 
              name="description" 
              placeholder={t("briefDesc")}
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="mt-2 bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800">
              {t("addClinicTypeBtn")}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("code")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("nameEN")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("nameAR")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("status")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clinicTypes?.map((type) => (
              <ClinicTypeRow key={type.id} type={type} />
            ))}
            {!clinicTypes?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  {t("noClinicTypes")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
