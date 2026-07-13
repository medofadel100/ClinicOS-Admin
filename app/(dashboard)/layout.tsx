"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/layout/notification-bell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, language, setLanguage, dir } = useLanguage();
  const supabase = createClient();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir={dir}>
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-800">
          ClinicOS Admin
        </div>
        <nav className="flex flex-col gap-1 text-sm font-medium p-4">
          <Link href="/" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("dashboard") || "Dashboard"}
          </Link>
          <Link href="/clinics" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("clinics") || "Clinics"}
          </Link>
          <Link href="/usage" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("usageReports") || "Usage Reports"}
          </Link>
          <Link href="/upgrades" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("upgradeRequests") || "Upgrade Requests"}
          </Link>
          <Link href="/discounts" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("discountCodes") || "Discount Codes"}
          </Link>
          <Link href="/announcements" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("announcements") || "Announcements"}
          </Link>
          <Link href="/payments" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("payments") || "Payments"}
          </Link>
          <Link href="/audit-logs" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("auditLogs") || "Audit Logs"}
          </Link>
          <Link href="/admins" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("manageAdmins") || "Manage Admins"}
          </Link>
          <Link href="/clinic-types" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("clinicTypes") || "Clinic Types"}
          </Link>
          <Link href="/features" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("features") || "Features"}
          </Link>
          <Link href="/plans" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            {t("plans") || "Subscription Plans"}
          </Link>
          <Link href="/profile" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-blue-300 mt-4">
            {t("profile") || "My Profile"}
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="font-semibold text-lg md:hidden">ClinicOS</div>
          <div className="flex items-center gap-4 ml-auto">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Language Toggle */}
            <div className="flex bg-slate-100 rounded-md p-1">
              <button
                onClick={() => setLanguage("ar")}
                className={`px-3 py-1 rounded-sm text-sm font-medium transition-colors ${
                  language === "ar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-sm text-sm font-medium transition-colors ${
                  language === "en" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                EN
              </button>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
            >
              {isLoggingOut ? "..." : (t("logout") || "Logout")}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
