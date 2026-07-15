import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export async function POST(request: Request) {
  // Use service role client since this route authenticates via a service API key provided by the desktop app installer,
  // or via headers. For MVP, we verify Authorization header.
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  if (token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { serial_code, hardware_fingerprint, device_label } = body;

  if (!serial_code || !hardware_fingerprint) {
    return NextResponse.json({ error: "Missing serial_code or hardware_fingerprint" }, { status: 400 });
  }

  // 1. Fetch license
  const { data: license, error: licenseError } = await supabase
    .from("clinic_licenses")
    .select("*")
    .eq("serial_code", serial_code)
    .single();

  if (licenseError || !license) {
    return NextResponse.json({ error: "Invalid serial code" }, { status: 404 });
  }

  if (license.status !== "active") {
    return NextResponse.json({ error: `License is ${license.status}` }, { status: 403 });
  }

  const now = new Date();
  if (new Date(license.expires_at) < now) {
    return NextResponse.json({ error: "License has expired" }, { status: 403 });
  }

  // 2. Check if hardware fingerprint is already activated
  const { data: existingActivation } = await supabase
    .from("license_activations")
    .select("id, deactivated_at")
    .eq("license_id", license.id)
    .eq("hardware_fingerprint", hardware_fingerprint)
    .single();

  if (existingActivation && !existingActivation.deactivated_at) {
    // Already active on this device, just return payload
    return NextResponse.json({
      signed_payload: license.signed_payload,
      status: license.status,
      expires_at: license.expires_at
    });
  }

  // 3. Check activation limit
  if (license.activation_count >= license.max_activations) {
    return NextResponse.json({ error: "Maximum activations reached" }, { status: 403 });
  }

  // 4. Create activation
  const { error: activationError } = await supabase
    .from("license_activations")
    .insert({
      license_id: license.id,
      hardware_fingerprint,
      device_label: device_label || null,
      activated_at: now.toISOString()
    });

  if (activationError) {
    console.error("Activation error:", activationError);
    return NextResponse.json({ error: "Failed to create activation record" }, { status: 500 });
  }

  // 5. Increment activation count
  await supabase
    .from("clinic_licenses")
    .update({ activation_count: license.activation_count + 1 })
    .eq("id", license.id);

  return NextResponse.json({
    signed_payload: license.signed_payload,
    status: license.status,
    expires_at: license.expires_at
  });
}
