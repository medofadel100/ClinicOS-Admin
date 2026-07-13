"use client";

import { useState } from "react";
import { submitAnnouncement } from "@/app/actions/announcements";
import { useRouter } from "next/navigation";

export function CreateAnnouncementForm({ plans }: { plans: { id: string, name_en: string }[] }) {
  const router = useRouter();
  const [channel, setChannel] = useState<"email" | "whatsapp" | "both">("email");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrorMsg("");
    
    // Convert audience filter to JSON string
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
    <form action={handleSubmit} className="flex flex-col gap-6">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Internal Campaign Title</label>
        <input 
          name="title" 
          required 
          placeholder="e.g. Eid Discount Promo"
          className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Channel</label>
        <select 
          name="channel" 
          value={channel}
          onChange={(e) => setChannel(e.target.value as "email" | "whatsapp" | "both")}
          className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 bg-white"
        >
          <option value="email">Email Only</option>
          <option value="whatsapp">WhatsApp Only</option>
          <option value="both">Email & WhatsApp</option>
        </select>
      </div>

      {(channel === "email" || channel === "both") && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Email Subject</label>
          <input 
            name="subject" 
            required={channel === "email" || channel === "both"}
            placeholder="Special Offer Inside!"
            className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Message Body</label>
        <textarea 
          name="body" 
          required 
          rows={5}
          placeholder="Hello {{clinic_name}},\n\nWe have a special offer for you..."
          className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
        />
        <p className="text-xs text-slate-500">Supports placeholders: {'{{clinic_name}}'}, {'{{owner_name}}'}</p>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="font-semibold mb-4">Audience Filter</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Target Status</label>
            <select 
              name="target_status" 
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="trial">Trial Only</option>
              <option value="past_due">Past Due Only</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Target Plan</label>
            <select 
              name="target_plan" 
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 bg-white"
            >
              <option value="">All Plans</option>
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
          {loading ? "Processing..." : "Create & Start Sending"}
        </button>
      </div>
    </form>
  );
}
