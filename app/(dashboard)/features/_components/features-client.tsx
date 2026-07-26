"use client";

import { useLanguage } from "@/lib/i18n/context";
import { addFeature } from "../actions";
import { FeatureRow } from "./feature-row";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FeaturesClient({ features }: { features: any[] }) {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t("featureCatalog")}</h1>
        <p className="text-slate-600">{t("manageFeaturesPricing")}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">{t("addNewFeature")}</h2>
        <form action={addFeature} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="text-sm font-medium">{t("category")}</label>
            <input 
              name="category" 
              required 
              placeholder={t("categoryPlaceholder")}
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("nameEnglish")}</label>
            <input 
              name="name_en" 
              required 
              placeholder="Offline App"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("nameArabic")}</label>
            <input 
              name="name_ar" 
              required 
              placeholder="تطبيق أوفلاين"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 text-right"
              dir="rtl"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("basePriceOptional")}</label>
            <input 
              name="base_price_egp" 
              type="number"
              step="0.01"
              placeholder="0.00"
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="md:col-span-2 mt-2">
            <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800">
              {t("addFeatureBtn")}
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
              <th className="px-6 py-3 font-semibold text-slate-700">{t("category")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("basePrice")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("status")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {features?.map((feature) => (
              <FeatureRow key={feature.id} feature={feature} />
            ))}
            {!features?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  {t("noFeaturesFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
