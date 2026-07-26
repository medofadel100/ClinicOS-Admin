import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serial_code, clinic_name, owner_full_name, owner_email, owner_password, owner_phone, clinic_type_id } = body;

    if (!serial_code || !clinic_name || !owner_full_name || !owner_email || !owner_password || !owner_phone || !clinic_type_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the serial
    const { data: serial, error: serialError } = await supabaseAdmin
      .from("clinic_serials")
      .select("*, plans!clinic_serials_plan_id_fkey (*)")
      .eq("code", serial_code.trim().toUpperCase())
      .single();

    if (serialError || !serial) {
      return NextResponse.json({ error: "Serial not found" }, { status: 404 });
    }

    if (serial.status !== "unused") {
      return NextResponse.json({ error: "Serial already used or cancelled" }, { status: 400 });
    }

    // Check email not already registered
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUser?.users?.some((u) => u.email === owner_email);
    if (emailExists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: owner_email,
      password: owner_password,
      email_confirm: true,
    });

    if (authError || !authUser?.user) {
      return NextResponse.json({ error: authError?.message || "Failed to create user" }, { status: 500 });
    }

    // Create clinic
    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from("clinics")
      .insert({
        name: clinic_name,
        clinic_type_id,
        owner_full_name,
        owner_email,
        owner_phone,
        status: "active",
      })
      .select("id")
      .single();

    if (clinicError || !clinic) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: "Failed to create clinic" }, { status: 500 });
    }

    // Create subscription
    const now = new Date();
    const periodEnd = new Date(now);
    if (serial.plans.billing_cycle === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const { error: subError } = await supabaseAdmin
      .from("clinic_subscriptions")
      .insert({
        clinic_id: clinic.id,
        plan_id: serial.plan_id,
        status: "active",
        price_locked_egp: serial.plans.price_egp,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      });

    if (subError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
    }

    // Mark serial as used
    await supabaseAdmin
      .from("clinic_serials")
      .update({ status: "used", clinic_id: clinic.id, used_at: now.toISOString() })
      .eq("id", serial.id);

    return NextResponse.json({
      success: true,
      clinic_id: clinic.id,
      message: "Account activated successfully",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
