"use client";

import { useLanguage } from "@/lib/i18n/context";

export default function Home() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50 text-slate-900">
      <main className="flex flex-col items-center gap-6 p-10 bg-white rounded-2xl shadow-sm border border-slate-200 min-w-[400px]">
        <h1 className="text-2xl font-bold text-slate-800 text-center">{t("welcomeMessage")}</h1>
        
        <div className="flex flex-col gap-4 w-full mt-4">
          <div className="flex items-center justify-between border-b pb-6">
            <span className="font-medium text-slate-600">{t("language")}:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage("ar")}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${language === "ar" ? "bg-slate-900 text-white font-medium" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {t("arabic")}
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${language === "en" ? "bg-slate-900 text-white font-medium" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {t("english")}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <label className="text-sm font-medium text-slate-700">{t("email")}</label>
            <input type="email" className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" placeholder="admin@example.com" />
            
            <label className="text-sm font-medium text-slate-700 mt-2">{t("password")}</label>
            <input type="password" className="border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" placeholder="********" />
            
            <button className="mt-6 px-4 py-2.5 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors">
              {t("login")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
