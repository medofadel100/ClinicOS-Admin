"use client";

import { useLanguage } from "@/lib/i18n/context";
import { createAdmin } from "../actions";

interface Admin {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Props {
  admins: Admin[] | null;
}

export function AdminsClient({ admins }: Props) {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t("manageAdmins")}</h1>
        <p className="text-slate-600">{t("addNewAdmin")}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">{t("addNewAdmin")}</h2>
        <form action={async (formData) => { await createAdmin(formData); }} className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("fullName")}</label>
            <input
              name="full_name"
              required
              placeholder={t("adminName")}
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("email")}</label>
            <input
              name="email"
              type="email"
              required
              placeholder={t("adminEmail")}
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("password")}</label>
            <input
              name="password"
              type="password"
              required
              placeholder={t("securePassword")}
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("roleLabel")}</label>
            <select
              name="role"
              required
              className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 bg-white"
            >
              <option value="super_admin">{t("superAdminFull")}</option>
              <option value="accountant">{t("accountantBilling")}</option>
              <option value="support">{t("supportObserver")}</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-2 bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800"
          >
            {t("createAdmin")}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("name")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("roleLabel")}</th>
              <th className="px-6 py-3 font-semibold text-slate-700">{t("status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins?.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{admin.full_name}</td>
                <td className="px-6 py-4 text-slate-600 capitalize">{admin.role.replace("_", " ")}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      admin.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {admin.is_active ? t("active") : t("disabled")}
                  </span>
                </td>
              </tr>
            ))}
            {!admins?.length && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  {t("noAdminsFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
