import crypto from "crypto";
import { createClient } from "./supabase/server";
import { getClinicEntitlements } from "./entitlements";

// Returns the active license or creates one if it doesn't exist
export async function issueOrUpdateLicense(clinicId: string, expiresAt: Date) {
  const supabase = createClient();
  const privateKeyPem = process.env.LICENSE_PRIVATE_KEY;

  if (!privateKeyPem) {
    throw new Error("LICENSE_PRIVATE_KEY is not set in the environment.");
  }

  // 1. Get feature entitlements
  const features = await getClinicEntitlements(clinicId);
  const featureCodes = features.map((f) => f.code);

  // 2. Prepare payload
  const payloadData = {
    clinicId,
    expiresAt: expiresAt.toISOString(),
    features: featureCodes,
  };
  const payloadString = JSON.stringify(payloadData);

  // 3. Sign the payload
  const signature = crypto.sign(null, Buffer.from(payloadString), privateKeyPem).toString("base64");
  const payloadBase64 = Buffer.from(payloadString).toString("base64");
  const signedPayload = `${payloadBase64}.${signature}`;

  // 4. Generate a serial code if none exists for this clinic
  // We'll try to fetch the existing license first to reuse the serial code
  const { data: existingLicense } = await supabase
    .from("clinic_licenses")
    .select("serial_code, max_activations")
    .eq("clinic_id", clinicId)
    .single();

  let serialCode = existingLicense?.serial_code;
  if (!serialCode) {
    const randomPart1 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const randomPart2 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const randomPart3 = crypto.randomBytes(2).toString("hex").toUpperCase();
    serialCode = `CLOS-${randomPart1}-${randomPart2}-${randomPart3}`;
  }

  // Calculate max activations based on the plan
  const { data: sub } = await supabase
    .from("clinic_subscriptions")
    .select("plan_id")
    .eq("clinic_id", clinicId)
    .in("status", ["active", "trial"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let maxActivations = existingLicense?.max_activations || 1;
  if (sub) {
    const { data: limit } = await supabase
      .from("plan_limits")
      .select("max_value")
      .eq("plan_id", sub.plan_id)
      .eq("limit_type", "provider_seats")
      .single();
    if (limit && limit.max_value) {
      maxActivations = limit.max_value;
    }
  }

  // 5. Upsert the license
  const { data: license, error } = await supabase
    .from("clinic_licenses")
    .upsert(
      {
        clinic_id: clinicId,
        serial_code: serialCode,
        signed_payload: signedPayload,
        status: "active",
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
        max_activations: maxActivations,
      },
      { onConflict: "clinic_id" }
    )
    .select()
    .single();

  if (error || !license) {
    console.error("Failed to upsert clinic license", error);
    throw new Error(error?.message || "Failed to generate or update clinic license");
  }

  return license;
}
