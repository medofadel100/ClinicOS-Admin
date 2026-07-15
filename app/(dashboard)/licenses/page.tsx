import { getLicenses } from "@/app/actions/licenses"
import { createClient } from "@/lib/supabase/server"
import LicenseTable from "./_components/license-table"
import OfflineGeneratorModal from "./_components/offline-generator-modal"
import CreateLicenseModal from "./_components/create-license-modal"

export default async function LicensesPage() {
  const licenses = await getLicenses()
  const supabase = createClient()
  const { data: clinics } = await supabase.from("clinics").select("id, name").order("name")

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 animate-fade-in">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">License Management</h2>
          <p className="text-muted-foreground text-slate-500">
            Manage active licenses, trials, and generate offline payload files.
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
  )
}
