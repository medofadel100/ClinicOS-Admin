import { createClient } from "@/lib/supabase/server";
import { createClinic } from "./actions";
import { redirect } from "next/navigation";
import ClinicsListClient from "./_components/clinics-list-client";

export default async function ClinicsPage() {
  const supabase = createClient();
  
  const [{ data: clinics }, { data: types }, { data: plans }] = await Promise.all([
    supabase.from("clinics").select("*, clinic_types(name_en)").order("created_at", { ascending: false }),
    supabase.from("clinic_types").select("id, name_en").eq("is_active", true),
    supabase.from("plans").select("id, name_en, price_egp").eq("is_active", true).order("price_egp", { ascending: true })
  ]);

  async function handleCreateClinic(formData: FormData) {
    "use server";
    const result = await createClinic(formData);
    if (result.error) {
      console.error(result.error);
    } else if (result.clinicId) {
      redirect(`/clinics/${result.clinicId}`);
    }
  }

  return (
    <ClinicsListClient
      clinics={clinics || []}
      types={types || []}
      plans={plans || []}
      onCreateClinic={handleCreateClinic}
    />
  );
}
