"use server";

import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

/**
 * Fetch all licenses with clinic details
 */
export async function getLicenses() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clinic_licenses")
    .select(`
      *,
      clinics (
        id,
        name,
        email
      )
    `)
    .order("issued_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data as any[];
}

/**
 * Revoke a license and increment its version
 */
export async function revokeLicense(id: string) {
  const supabase = createClient();

  // Fetch current version
  const { data: licenseData, error: fetchError } = await supabase
    .from("clinic_licenses")
    .select("license_version")
    .eq("id", id)
    .single();

  const license = licenseData as any;
  if (fetchError || !license) throw new Error("License not found");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {
    status: "revoked",
    license_version: license.license_version + 1,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("clinic_licenses")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/licenses");
}

/**
 * Approve payment (Trial -> Active)
 */
export async function approvePayment(id: string, newExpiresAt?: string) {
  const supabase = createClient();

  const { data: licenseData, error: fetchError } = await supabase
    .from("clinic_licenses")
    .select("license_version, status")
    .eq("id", id)
    .single();

  const license = licenseData as any;
  if (fetchError || !license) throw new Error("License not found");
  if (license.status !== "trial") throw new Error("License is not in trial status");

  const updates: Record<string, unknown> = {
    status: "active",
    license_version: license.license_version + 1,
    updated_at: new Date().toISOString(),
  };

  if (newExpiresAt) {
    updates.expires_at = newExpiresAt;
  }

  const { error } = await supabase
    .from("clinic_licenses")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updates as any)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/licenses");
}

/**
 * Update Serial and regenerate signed_payload
 */
export async function updateSerial(id: string, newSerial: string) {
  const supabase = createClient();

  const { data: licenseData, error: fetchError } = await supabase
    .from("clinic_licenses")
    .select("license_version, clinic_id, expires_at, signed_payload")
    .eq("id", id)
    .single();

  const license = licenseData as any;
  if (fetchError || !license) throw new Error("License not found");

  // We need to parse the existing payload to keep its features, or generate a new basic payload
  let existingPayloadObj: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(license.signed_payload);
    existingPayloadObj = parsed.payload || {};
  } catch {
    // Fallback if parsing fails
  }

  const newVersion = license.license_version + 1;

  const payload = {
    ...existingPayloadObj,
    clinicId: license.clinic_id,
    expiresAt: license.expires_at,
    licenseVersion: newVersion,
  };

  const signedPayload = signPayloadJSON(payload);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {
    serial_code: newSerial,
    signed_payload: signedPayload,
    license_version: newVersion,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("clinic_licenses")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/licenses");
}

/**
 * Helper to generate the JSON signed payload for the database
 */
function signPayloadJSON(payload: Record<string, unknown>): string {
  const privateKeyPem = process.env.CLINICOS_PRIVATE_KEY;
  if (!privateKeyPem) throw new Error("CLINICOS_PRIVATE_KEY is not configured in Vercel.");

  const formattedKey = privateKeyPem.replace(/\\n/g, "\n");
  const payloadString = JSON.stringify(payload);

  const privateKey = crypto.createPrivateKey({
    key: formattedKey,
    format: "pem",
    type: "pkcs8",
  });

  // Desktop verify.ts expects signatureHex for the JSON payload
  const signature = crypto.sign(null, Buffer.from(payloadString), privateKey);
  const signatureHex = signature.toString("hex");

  return JSON.stringify({
    payload,
    signature: signatureHex,
  });
}

/**
 * Generate Offline License File Content (.clinicos)
 * Format: Base64(Payload) + "." + Base64(Signature)
 */
export async function generateOfflineLicense(
  clinicId: string,
  features: string[],
  expiresAt: string
) {
  const privateKeyPem = process.env.CLINICOS_PRIVATE_KEY;
  if (!privateKeyPem) throw new Error("CLINICOS_PRIVATE_KEY is not configured in Vercel.");

  const formattedKey = privateKeyPem.replace(/\\n/g, "\n");

  const payload = {
    clinicId,
    features,
    expiresAt,
    issuedAt: new Date().toISOString(),
  };

  const payloadString = JSON.stringify(payload);

  const privateKey = crypto.createPrivateKey({
    key: formattedKey,
    format: "pem",
    type: "pkcs8", // Standard format for Ed25519 private keys in Node
  });

  const signature = crypto.sign(null, Buffer.from(payloadString), privateKey);

  const payloadBase64 = Buffer.from(payloadString).toString("base64");
  const signatureBase64 = signature.toString("base64"); // As requested by user

  return `${payloadBase64}.${signatureBase64}`;
}
