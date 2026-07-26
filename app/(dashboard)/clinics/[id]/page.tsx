import { createClient } from "@/lib/supabase/server";
import { createOverride, deleteOverride } from "../actions";
import { recordPayment } from "../../payments/actions";
import { getClinicEntitlements } from "@/lib/entitlements";
import { notFound } from "next/navigation";
import ClinicDetailClient from "./_components/clinic-detail-client";

export default async function ClinicDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const [
    { data: clinic },
    { data: subscriptions },
    { data: plans },
    { data: overrides },
    { data: features },
    entitlements,
    { data: payments },
    { data: license }
  ] = await Promise.all([
    supabase.from("clinics").select("*, clinic_types(name_en)").eq("id", params.id).single(),
    supabase.from("clinic_subscriptions").select("*, plans(name_en)").eq("clinic_id", params.id).order("created_at", { ascending: false }),
    supabase.from("plans").select("id, name_en, price_egp").eq("is_active", true).order("price_egp", { ascending: true }),
    supabase.from("account_feature_overrides").select("*, features(name_en), platform_admins(full_name)").eq("clinic_id", params.id).order("created_at", { ascending: false }),
    supabase.from("features").select("id, name_en, base_price_egp").eq("is_active", true).order("name_en", { ascending: true }),
    getClinicEntitlements(params.id),
    supabase.from("payments").select("*, platform_admins(full_name)").eq("clinic_id", params.id).order("paid_at", { ascending: false }),
    supabase.from("clinic_licenses").select("*, license_activations(*)").eq("clinic_id", params.id).single()
  ]);

  if (!clinic) return notFound();

  async function handleCreateOverride(formData: FormData) {
    "use server";
    await createOverride(formData);
  }

  async function handleDeleteOverride(overrideId: string) {
    "use server";
    await deleteOverride(overrideId, params.id);
  }

  async function handleRecordPayment(formData: FormData) {
    "use server";
    await recordPayment(formData);
  }

  return (
    <ClinicDetailClient
      clinic={clinic}
      clinicId={params.id}
      subscriptions={subscriptions || []}
      plans={plans || []}
      overrides={overrides || []}
      features={features || []}
      entitlements={entitlements}
      payments={payments || []}
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      license={license as any}
      hasOfflineAccess={entitlements.some((e: { code: string }) => e.code === "offline_desktop_app")}
      onCreateOverride={handleCreateOverride}
      onDeleteOverride={handleDeleteOverride}
      onRecordPayment={handleRecordPayment}
    />
  );
}
