import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { serialCode } = body;
  if (!serialCode) {
    return NextResponse.json({ error: "Missing serialCode" }, { status: 400 });
  }

  // 2. Validate serial code
  const { data: license, error: licenseError } = await supabase
    .from("clinic_licenses")
    .select("id, clinic_id, status")
    .eq("serial_code", serialCode)
    .single();

  if (licenseError || !license) {
    return NextResponse.json({ error: "Invalid serial code" }, { status: 404 });
  }

  if (license.status === "revoked" || license.status === "expired") {
    return NextResponse.json({ error: `License is ${license.status}` }, { status: 403 });
  }

  // 3. Link the user to the clinic (by setting owner_email)
  // Since we don't have a user_licenses table, we link the user by making them the owner of the clinic attached to the license.
  const { error: clinicUpdateError } = await supabase
    .from("clinics")
    .update({ owner_email: userEmail })
    .eq("id", license.clinic_id);

  if (clinicUpdateError) {
    console.error("Failed to link user to clinic:", clinicUpdateError);
    return NextResponse.json({ error: "Failed to link license to user account" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "License linked successfully" });
}
