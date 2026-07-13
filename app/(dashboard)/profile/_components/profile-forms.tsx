"use client";

import { useState } from "react";
import { updateProfile, updatePassword } from "@/app/actions/profile";

export function ProfileForms({ 
  initialName, 
  initialLanguage, 
  email, 
  role 
}: { 
  initialName: string, 
  initialLanguage: string, 
  email: string, 
  role: string 
}) {
  const [profileMsg, setProfileMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  async function handleProfileSubmit(formData: FormData) {
    setProfileMsg(null);
    const res = await updateProfile(formData);
    if (res.error) setProfileMsg({ type: 'error', text: res.error });
    else setProfileMsg({ type: 'success', text: "Profile updated successfully. Refresh if language changed." });
  }

  async function handlePasswordSubmit(formData: FormData) {
    setPasswordMsg(null);
    const res = await updatePassword(formData);
    if (res.error) setPasswordMsg({ type: 'error', text: res.error });
    else setPasswordMsg({ type: 'success', text: "Password updated successfully." });
    
    // Reset form
    const form = document.getElementById('password-form') as HTMLFormElement;
    if (form) form.reset();
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Read-only info */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-slate-500 block">Email Address</span>
            <span className="font-medium text-slate-900">{email}</span>
          </div>
          <div>
            <span className="text-sm text-slate-500 block">Role</span>
            <span className="font-medium text-slate-900 capitalize">{role.replace("_", " ")}</span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Personal Details</h2>
        <form action={handleProfileSubmit} className="flex flex-col gap-4 max-w-md">
          {profileMsg && (
            <div className={`p-3 rounded-md text-sm ${profileMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {profileMsg.text}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              name="full_name" 
              defaultValue={initialName}
              required 
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Dashboard Language</label>
            <select 
              name="language" 
              defaultValue={initialLanguage}
              required
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 bg-white"
            >
              <option value="en">English (LTR)</option>
              <option value="ar">العربية (RTL)</option>
            </select>
          </div>
          <button type="submit" className="mt-2 bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 w-fit">
            Save Changes
          </button>
        </form>
      </div>

      {/* Password Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form id="password-form" action={handlePasswordSubmit} className="flex flex-col gap-4 max-w-md">
          {passwordMsg && (
            <div className={`p-3 rounded-md text-sm ${passwordMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {passwordMsg.text}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">New Password</label>
            <input 
              name="new_password" 
              type="password"
              required 
              minLength={6}
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Confirm New Password</label>
            <input 
              name="confirm_password" 
              type="password"
              required 
              minLength={6}
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <button type="submit" className="mt-2 bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 w-fit">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
