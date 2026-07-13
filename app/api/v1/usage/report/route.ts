import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const serviceKey = request.headers.get("x-service-key");

  if (!serviceKey || serviceKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { clinic_id, usage_type, quantity, period_month } = await request.json();

    if (!clinic_id || !usage_type || quantity === undefined) {
      return new NextResponse(JSON.stringify({ error: "clinic_id, usage_type, and quantity are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Default to the first day of the current month
    let targetPeriod = period_month;
    if (!targetPeriod) {
      const now = new Date();
      targetPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("usage_logs")
      .insert({
        clinic_id,
        usage_type,
        quantity,
        period_month: targetPeriod,
      })
      .select()
      .single();

    if (error) {
      return new NextResponse(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return NextResponse.json({ success: true, log: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
