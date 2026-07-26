"use client";

import React, { useState, useEffect } from "react";

type ClinicType = { id: string; name_en: string; name_ar: string; code: string };

export default function SerialActivationPage() {
  const [clinicTypes, setClinicTypes] = useState<ClinicType[]>([]);
  const [serialCode, setSerialCode] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [ownerFullName, setOwnerFullName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [clinicTypeId, setClinicTypeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinic_types?is_active=eq.true&select=id,name_en,name_ar,code`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })
      .then((r) => r.json())
      .then((d) => setClinicTypes(d))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (ownerPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (ownerPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/serial/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial_code: serialCode.trim().toUpperCase(),
          clinic_name: clinicName,
          owner_full_name: ownerFullName,
          owner_email: ownerEmail,
          owner_password: ownerPassword,
          owner_phone: ownerPhone,
          clinic_type_id: clinicTypeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Activation failed");
        setIsSuccess(false);
      } else {
        setMessage("Account activated successfully! You can now log in.");
        setIsSuccess(true);
      }
    } catch {
      setMessage("Network error. Please try again.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Activation Successful!</h1>
          <p className="text-slate-600 mb-6">{message}</p>
          <a href="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Activate Your Account</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your serial code to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Serial Code */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Serial Code *</label>
            <input
              type="text"
              value={serialCode}
              onChange={(e) => setSerialCode(e.target.value)}
              placeholder="XXXX-XXXX-XXXX"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-center tracking-widest"
              required
            />
          </div>

          {/* Clinic Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name *</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Owner Full Name *</label>
            <input
              type="text"
              value={ownerFullName}
              onChange={(e) => setOwnerFullName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          {/* Clinic Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Type *</label>
            <select
              value={clinicTypeId}
              onChange={(e) => setClinicTypeId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="">Select clinic type</option>
              {clinicTypes.map((ct) => (
                <option key={ct.id} value={ct.id}>{ct.name_en}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {message && !isSuccess && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">{message}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Activating..." : "Activate Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
