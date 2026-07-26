"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { generateSerials, cancelSerial } from "../actions";

type SerialRow = {
  id: string;
  code: string;
  status: string;
  created_at: string;
  used_at: string | null;
  plans: { id: string; name_ar: string; name_en: string; code: string; price_egp: number } | null;
  clinics: { id: string; name: string } | null;
  platform_admins: { full_name: string } | null;
};

type PlanRow = {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
  price_egp: number;
};

export function SerialsClient({ serials, plans }: { serials: SerialRow[]; plans: PlanRow[] }) {
  const { t, dir } = useLanguage();
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = serials.filter((s) => filterStatus === "all" || s.status === filterStatus);
  const unusedCount = serials.filter((s) => s.status === "unused").length;
  const usedCount = serials.filter((s) => s.status === "used").length;

  const handleGenerate = async () => {
    if (!selectedPlan || quantity < 1) return;
    setLoading(true);
    try {
      const result = await generateSerials(selectedPlan, quantity);
      setGeneratedCodes(result.map((s) => s.code));
      setShowGenerate(false);
      setSelectedPlan("");
      setQuantity(1);
    } catch {
      alert("Error generating serials");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm(t("confirmCancelSerial"))) return;
    try {
      await cancelSerial(id);
      window.location.reload();
    } catch {
      alert("Error cancelling serial");
    }
  };

  const copyToClipboard = async (code: string, id?: string) => {
    await navigator.clipboard.writeText(code);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "unused": return "bg-emerald-100 text-emerald-700";
      case "used": return "bg-blue-100 text-blue-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div dir={dir} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("serialManagement")}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {t("serialCount")}: {serials.length} | {t("unusedSerials")}: {unusedCount} | {t("usedSerials")}: {usedCount}
          </p>
        </div>
        <button
          onClick={() => setShowGenerate(!showGenerate)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + {t("generateNewSerial")}
        </button>
      </div>

      {/* Generate Form */}
      {showGenerate && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold">{t("generateSerials")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("selectPlan")}</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">{t("selectPlan")}</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_en} - {p.price_egp} EGP
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("quantity")}</label>
              <input
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={!selectedPlan || loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm disabled:opacity-50"
              >
                {loading ? "..." : t("generateSerial")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Codes */}
      {generatedCodes.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-emerald-800">{t("serialsGenerated")}</h3>
            <button
              onClick={() => copyToClipboard(generatedCodes.join("\n"))}
              className="text-sm text-emerald-700 hover:text-emerald-900 font-medium"
            >
              {allCopied ? t("copied") : t("copyAll")}
            </button>
          </div>
          <div className="space-y-1">
            {generatedCodes.map((code, i) => (
              <div key={i} className="font-mono text-sm text-emerald-900">{code}</div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "unused", "used", "cancelled"].map((s) => (
          <button
            key={s === "all" ? "all" : s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === s
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s === "all" ? t("all") : t(s as "unused" | "used" | "cancelled")}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">{t("noSerialsFound")}</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">{t("serialCode")}</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">{t("serialPlan")}</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">{t("serialStatus")}</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">{t("serialClinic")}</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">{t("serialCreatedAt")}</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">{t("serialUsedAt")}</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">{t("serialActions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((serial) => (
                  <tr key={serial.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{serial.code}</span>
                        <button
                          onClick={() => copyToClipboard(serial.code, serial.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {copiedId === serial.id ? t("copied") : t("copySerial")}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {serial.plans ? `${serial.plans.name_en} (${serial.plans.price_egp} EGP)` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(serial.status)}`}>
                        {t(serial.status as "unused" | "used" | "cancelled")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {serial.clinics ? (
                        <a href={`/clinics/${serial.clinics.id}`} className="text-blue-600 hover:underline">
                          {serial.clinics.name}
                        </a>
                      ) : (
                        <span className="text-slate-400">{t("noClinic")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(serial.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {serial.used_at ? new Date(serial.used_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {serial.status === "unused" && (
                        <button
                          onClick={() => handleCancel(serial.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          {t("cancelSerial")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
