import { getLicenses } from "@/app/actions/licenses"
import { createClient } from "@/lib/supabase/server"
import { LicensesClient } from "./_components/licenses-client"

export default async function LicensesPage() {
  const licenses = await getLicenses()
  const supabase = createClient()
  const { data: clinics } = await supabase.from("clinics").select("id, name").order("name")

  return <LicensesClient licenses={licenses} clinics={clinics || []} />
}
