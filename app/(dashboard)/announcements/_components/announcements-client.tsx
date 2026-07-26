"use client";

import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";
import { Plus } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AnnouncementsClient({ announcements, isSuperAdmin }: { announcements: any[], isSuperAdmin: boolean }) {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t("announcements")}</h1>
          <p className="text-slate-600">{t("viewExternalMessages")}</p>
        </div>
        {isSuperAdmin && (
          <Link href="/announcements/create" className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />
            {t("newAnnouncement")}
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("title")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("channel")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("status")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("date")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("createdBy")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {announcements?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{item.title}</td>
                <td className="px-6 py-4 text-slate-600 capitalize">{item.channel}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'sent' ? 'bg-green-100 text-green-700' :
                    item.status === 'failed' ? 'bg-red-100 text-red-700' :
                    item.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {item.platform_admins?.full_name || "Unknown"}
                </td>
              </tr>
            ))}
            {!announcements?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  {t("noAnnouncements")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
