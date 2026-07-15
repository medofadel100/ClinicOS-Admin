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
  const sign = crypto.createSign("ed25519");
  sign.update(payloadString);
  sign.end();
  const signature = sign.sign(privateKeyPem, "base64");
  const payloadBase64 = Buffer.from(payloadString).toString("base64");
  const signedPayload = `${payloadBase64}.${signature}`;

  // 4. Generate a serial code if none exists for this clinic
  // We'll try to fetch the existing license first to reuse the serial code
  const { data: existingLicense } = await supabase
    .from("clinic_licenses")
    .select("serial_code")
    .eq("clinic_id", clinicId)
    .single();

  let serialCode = existingLicense?.serial_code;
  if (!serialCode) {
    const randomPart1 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const randomPart2 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const randomPart3 = crypto.randomBytes(2).toString("hex").toUpperCase();
    serialCode = `CLOS-${randomPart1}-${randomPart2}-${randomPart3}`;
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
      },
      { onConflict: "clinic_id" }
    )
    .select()
    .single();

  if (error || !license) {
    console.error("Failed to upsert clinic license", error);
    throw new Error("Failed to generate or update clinic license");
  }

  return license;
}
