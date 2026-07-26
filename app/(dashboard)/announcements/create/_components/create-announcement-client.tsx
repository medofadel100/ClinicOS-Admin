"use client";

import { useLanguage } from "@/lib/i18n/context";
import { useState } from "react";
import { submitAnnouncement } from "@/app/actions/announcements";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CreateAnnouncementClient({ plans }: { plans: { id: string, name_en: string }[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [channel, setChannel] = useState<"email" | "whatsapp" | "both">("email");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrorMsg("");
    
    const filter = {
      status: formData.get("target_status") || undefined,
      plan_id: formData.get("target_plan") || undefined,
    };
    formData.append("audience_filter", JSON.stringify(filter));

    const res = await submitAnnouncement(formData);
    setLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      router.push("/announcements");
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t("newAnnouncement")}</h1>
        <p className="text-slate-600">{t("sendEmailOrWhatsApp")}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <form action={handleSubmit} className="flex flex-col gap-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("internalCampaignTitle")}</label>
            <input 
              name="title" 
              required 
              placeholder={t("eidPromo")}
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("channel")}</label>
            <select 
              name="channel" 
              value={channel}
              onChange={(e) => setChannel(e.target.value as "email" | "whatsapp" | "both")}
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 bg-white"
            >
              <option value="email">{t("emailOnly")}</option>
              <option value="whatsapp">{t("whatsAppOnly")}</option>
              <option value="both">{t("emailAndWhatsApp")}</option>
            </select>
          </div>

          {(channel === "email" || channel === "both") && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{t("emailSubject")}</label>
              <input 
                name="subject" 
                required={channel === "email" || channel === "both"}
                placeholder={t("specialOffer")}
                className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("messageBody")}</label>
            <textarea 
              name="body" 
              required 
              rows={5}
              placeholder={t("messageBodyPlaceholder")}
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
            <p className="text-xs text-slate-500">{t("supportsPlaceholders")}</p>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold mb-4">{t("audienceFilter")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">{t("targetStatus")}</label>
                <select 
                  name="target_status" 
                  className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 bg-white"
                >
                  <option value="">{t("allStatuses")}</option>
                  <option value="active">{t("activeOnly")}</option>
                  <option value="trial">{t("trialOnly")}</option>
                  <option value="past_due">{t("pastDueOnly")}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">{t("targetPlan")}</label>
                <select 
                  name="target_plan" 
                  className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 bg-white"
                >
                  <option value="">{t("allPlans")}</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name_en}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-slate-900 text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? t("processing") : t("createAndSend")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
