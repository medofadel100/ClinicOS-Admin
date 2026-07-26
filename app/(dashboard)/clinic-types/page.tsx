import { createClient } from "@/lib/supabase/server";
import { ClinicTypesClient } from "./_components/clinic-types-client";

export default async function ClinicTypesPage() {
  const supabase = createClient();
  
  const { data: clinicTypes } = await supabase
    .from("clinic_types")
    .select("*")
    .order("created_at", { ascending: false });

  return <ClinicTypesClient clinicTypes={clinicTypes || []} />;
}
