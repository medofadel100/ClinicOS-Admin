import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request) {
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
  const { data: license, error: licenseError } = await supabase
    .from("clinic_licenses")
    .select("signed_payload, status, expires_at")
    .eq("clinic_id", clinic.id)
    .single();

  if (licenseError || !license) {
    return NextResponse.json({ error: "No license found" }, { status: 404 });
  }

  if (license.status !== "active") {
    return NextResponse.json({ error: "License is not active", status: license.status }, { status: 403 });
  }

  return NextResponse.json({
    signed_payload: license.signed_payload,
    status: license.status,
    expires_at: license.expires_at
  });
}
