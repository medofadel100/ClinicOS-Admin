"use client";

import { useState } from "react";
import { broadcastNotification } from "@/app/actions/notifications";

export function BroadcastForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    const res = await broadcastNotification(formData);
    setLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg("Notification broadcasted successfully!");
      // Reset form
      const form = document.getElementById("broadcast-form") as HTMLFormElement;
      if (form) form.reset();
    }
  }

  return (
    <form id="broadcast-form" action={handleSubmit} className="flex flex-col gap-6">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
          {successMsg}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Title</label>
        <input 
          name="title" 
          required 
          placeholder="e.g. System Maintenance Tonight"
          className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Message Body</label>
        <textarea 
          name="body" 
          required 
          rows={3}
          placeholder="Please note that the system will be down for 5 minutes at midnight..."
          className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Link URL (Optional)</label>
        <input 
          name="link_url" 
          placeholder="e.g. /clinics/some-id"
          className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
        />
        <p className="text-xs text-slate-500">Admins will be navigated here when they click the notification.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Target Role</label>
        <select 
          name="target_role" 
          className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 bg-white"
        >
          <option value="">All Admins</option>
          <option value="super_admin">Super Admins Only</option>
          <option value="accountant">Accountants Only</option>
          <option value="support">Support / Observers Only</option>
        </select>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-slate-900 text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Broadcasting..." : "Send Broadcast"}
        </button>
      </div>
    </form>
  );
}
