import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createClient();

  // 1. Authenticate user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = user.email;
  if (!userEmail) {
    return NextResponse.json({ error: "No email associated with session" }, { status: 400 });
  }

  // Check query params for version
  const { searchParams } = new URL(request.url);
  const clientVersionStr = searchParams.get("version");
  const clientVersion = clientVersionStr ? parseInt(clientVersionStr, 10) : null;

  // 2. Find the clinic by owner_email
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("id")
    .eq("owner_email", userEmail)
    .single();

  if (clinicError || !clinic) {
    return NextResponse.json({ error: "Clinic not found for this user" }, { status: 404 });
  }

  // 3. Fetch current license
  // Including license_version as per new DB schema update
  const { data: licenseData, error: licenseError } = await supabase
    .from("clinic_licenses")
    .select("signed_payload, status, expires_at, license_version")
    .eq("clinic_id", clinic.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const license = licenseData as any;
  if (licenseError || !license) {
    return NextResponse.json({ error: "No license found" }, { status: 404 });
  }

  if (license.status === "revoked") {
    return NextResponse.json({ error: "License has been revoked", status: license.status }, { status: 403 });
  }
  
  if (license.status !== "active") {
    return NextResponse.json({ error: "License is not active", status: license.status }, { status: 403 });
  }

  // If the client provided a version and the DB version is higher, consider it revoked/invalidated
  if (clientVersion !== null && license.license_version !== undefined && license.license_version > clientVersion) {
    return NextResponse.json({ error: "License version mismatch", status: "version_mismatch" }, { status: 403 });
  }

  return NextResponse.json({
    signed_payload: license.signed_payload,
    status: license.status,
    expires_at: license.expires_at,
    license_version: license.license_version || 1
  });
}
