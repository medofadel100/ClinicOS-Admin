import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClinicEntitlements } from "@/lib/entitlements";

export async function POST(request: NextRequest) {
  const serviceKey = request.headers.get("x-service-key");

  if (!serviceKey || serviceKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { clinic_id, feature_id } = await request.json();

    if (!clinic_id || !feature_id) {
      return new NextResponse(JSON.stringify({ error: "clinic_id and feature_id are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const adminClient = createAdminClient();
    const entitlements = await getClinicEntitlements(clinic_id, adminClient);

    const hasEntitlement = entitlements.some(f => f.id === feature_id);

    return NextResponse.json({ has_entitlement: hasEntitlement });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
