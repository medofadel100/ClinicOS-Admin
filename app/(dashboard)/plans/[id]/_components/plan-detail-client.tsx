"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { addPlanLimit, removePlanLimit, removePlanFeature, addPlanFeatureAction } from "../actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PlanDetailClient({ plan, unassignedFeatures }: { plan: any; unassignedFeatures: any[] }) {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/plans" className="text-sm text-slate-500 hover:text-slate-900">&larr; {t("backToPlans")}</Link>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-1">{plan.name_en} / {plan.name_ar}</h1>
        <p className="text-slate-600">{t("manageLimitsFeatures")} {plan.code}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h2 className="text-xl font-bold border-b pb-2">{t("planLimits")}</h2>
          
          <ul className="flex flex-col gap-2">
            {plan.plan_limits.map((limit: {id: string, limit_type: string, max_value: number | null}) => (
              <li key={limit.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-100">
                <div>
                  <span className="capitalize font-medium block">{limit.limit_type.replace('_', ' ')}</span>
                  <span className="text-sm text-slate-600">{limit.max_value === null ? t("unlimited") : limit.limit_type === 'storage_mb' ? (limit.max_value / 1024) + ' GB' : limit.max_value}</span>
                </div>
                <form action={removePlanLimit.bind(null, limit.id, plan.id)}>
                  <button className="text-red-600 text-sm hover:underline">{t("remove")}</button>
                </form>
              </li>
            ))}
            {plan.plan_limits.length === 0 && <li className="text-sm text-slate-500 italic">{t("noLimitsSet")}</li>}
          </ul>

          <form action={addPlanLimit} className="mt-4 border-t pt-4 flex flex-col gap-3">
            <input type="hidden" name="plan_id" value={plan.id} />
            <h3 className="text-sm font-semibold text-slate-700">{t("addOrUpdateLimit")}</h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">{t("limitType")}</label>
              <select name="limit_type" required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm bg-white">
                <option value="provider_seats">{t("providerSeats")}</option>
                <option value="patients">{t("patients")}</option>
                <option value="staff_accounts">{t("staffAccounts")}</option>
                <option value="storage_mb">{t("storageMB")}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">{t("maxValuePlaceholder")}</label>
              <input type="number" name="max_value" className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm" />
            </div>
            <button type="submit" className="bg-slate-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-800 self-start mt-2">{t("saveLimit")}</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h2 className="text-xl font-bold border-b pb-2">{t("bundledFeatures")}</h2>
          
          <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2">
            {plan.plan_features.map((pf: {feature_id: string, features: {name_en: string}}) => (
              <li key={pf.feature_id} className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-100">
                <span className="font-medium text-sm">{pf.features.name_en}</span>
                <form action={removePlanFeature.bind(null, plan.id, pf.feature_id)}>
                  <button className="text-red-600 text-sm hover:underline">{t("remove")}</button>
                </form>
              </li>
            ))}
            {plan.plan_features.length === 0 && <li className="text-sm text-slate-500 italic">{t("noFeaturesAssigned")}</li>}
          </ul>

          <div className="mt-4 border-t pt-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-700">{t("assignNewFeature")}</h3>
            {unassignedFeatures.length > 0 ? (
              <form action={addPlanFeatureAction} className="flex gap-2">
                <input type="hidden" name="plan_id" value={plan.id} />
                <select name="feature_id" required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm bg-white flex-1">
                  <option value="">{t("selectFeature")}</option>
                  {unassignedFeatures.map((f: {id: string, name_en: string}) => (
                    <option key={f.id} value={f.id}>{f.name_en}</option>
                  ))}
                </select>
                <button type="submit" className="bg-slate-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-800">{t("add")}</button>
              </form>
            ) : (
              <div className="text-sm text-slate-500 italic">{t("allFeaturesAssigned")}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
