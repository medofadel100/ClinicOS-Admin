"use client";

import { useLanguage } from "@/lib/i18n/context";
import LicenseTable from "./license-table";
import OfflineGeneratorModal from "./offline-generator-modal";
import CreateLicenseModal from "./create-license-modal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LicensesClient({ licenses, clinics }: { licenses: any[], clinics: { id: string, name: string }[] }) {
  const { t } = useLanguage();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 animate-fade-in">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("licenseManagement")}</h2>
          <p className="text-muted-foreground text-slate-500">
            {t("manageLicensesTrials")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateLicenseModal clinics={clinics || []} />
          <OfflineGeneratorModal />
        </div>
      </div>
      <div className="bg-white dark:bg-slate-950 border rounded-xl shadow-sm overflow-hidden">
        <LicenseTable initialData={licenses} />
      </div>
    </div>
  );
}
