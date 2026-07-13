import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const supabase = createClient();
  
  // Verify super admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  
  const { data: admin } = await supabase
    .from("platform_admins")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();
    
  if (admin?.role !== "super_admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  // Define standard features
  const standardFeatures = [
    { code: "offline_desktop_app", name_en: "Offline Desktop App", name_ar: "تطبيق سطح المكتب أوفلاين", category: "core", base_price_egp: 500 },
    { code: "clinic_website", name_en: "Clinic Website", name_ar: "موقع إلكتروني للعيادة", category: "marketing", base_price_egp: 300 },
    { code: "doctor_commissions", name_en: "Doctor Commissions", name_ar: "عمولات الأطباء", category: "finance", base_price_egp: 200 },
    { code: "recall_campaigns", name_en: "Recall Campaigns", name_ar: "حملات المتابعة والتذكير", category: "marketing", base_price_egp: 150 },
    { code: "queue_display", name_en: "Queue Display", name_ar: "شاشة الانتظار", category: "core", base_price_egp: 200 },
    { code: "white_label", name_en: "White Label", name_ar: "علامة تجارية خاصة", category: "branding", base_price_egp: 1000 },
    { code: "whatsapp_rule_bot", name_en: "WhatsApp Rule Bot", name_ar: "بوت واتساب (قوائم)", category: "automation", base_price_egp: null },
    { code: "whatsapp_ai_bot", name_en: "WhatsApp AI Bot", name_ar: "بوت واتساب (ذكاء اصطناعي)", category: "automation", base_price_egp: null }
  ];

  // Insert features (ignore duplicates based on 'code' unique constraint by using upsert)
  const { data: insertedFeatures, error: featureError } = await supabase
    .from("features")
    .upsert(standardFeatures, { onConflict: "code" })
    .select("id, code");
    
  if (featureError || !insertedFeatures) {
    console.error(featureError);
    return new NextResponse("Failed to insert features", { status: 500 });
  }

  const featureMap = insertedFeatures.reduce((acc, f) => {
    acc[f.code] = f.id;
    return acc;
  }, {} as Record<string, string>);

  // Define plans
  const standardPlans = [
    { code: "basic", name_en: "Basic", name_ar: "الأساسية", price_egp: 1000, billing_cycle: "monthly" as const },
    { code: "professional", name_en: "Professional", name_ar: "الاحترافية", price_egp: 2500, billing_cycle: "monthly" as const },
    { code: "advanced", name_en: "Advanced", name_ar: "المتقدمة", price_egp: 5000, billing_cycle: "monthly" as const },
    { code: "offline", name_en: "Offline", name_ar: "الأوفلاين", price_egp: 1500, billing_cycle: "monthly" as const }
  ];

  const { data: insertedPlans, error: planError } = await supabase
    .from("plans")
    .upsert(standardPlans, { onConflict: "code" })
    .select("id, code");

  if (planError || !insertedPlans) {
    console.error(planError);
    return new NextResponse("Failed to insert plans", { status: 500 });
  }

  const planMap = insertedPlans.reduce((acc, p) => {
    acc[p.code] = p.id;
    return acc;
  }, {} as Record<string, string>);

  // Define Plan Limits
  const limits = [
    // Basic
    { plan_id: planMap["basic"], limit_type: "provider_seats" as const, max_value: 2 },
    { plan_id: planMap["basic"], limit_type: "patients" as const, max_value: 500 },
    { plan_id: planMap["basic"], limit_type: "staff_accounts" as const, max_value: 2 },
    // Professional
    { plan_id: planMap["professional"], limit_type: "provider_seats" as const, max_value: 5 },
    { plan_id: planMap["professional"], limit_type: "patients" as const, max_value: 3000 },
    { plan_id: planMap["professional"], limit_type: "staff_accounts" as const, max_value: 5 },
    // Advanced
    { plan_id: planMap["advanced"], limit_type: "provider_seats" as const, max_value: 10 },
    { plan_id: planMap["advanced"], limit_type: "patients" as const, max_value: null }, // unlimited
    { plan_id: planMap["advanced"], limit_type: "staff_accounts" as const, max_value: null }, // unlimited
    // Offline
    { plan_id: planMap["offline"], limit_type: "provider_seats" as const, max_value: 2 },
    { plan_id: planMap["offline"], limit_type: "patients" as const, max_value: 500 },
    { plan_id: planMap["offline"], limit_type: "staff_accounts" as const, max_value: 2 },
  ];

  // Insert Limits (safely skipping if they already exist, by doing upsert with unique constraint on plan_id + limit_type)
  // Unfortunately, Supabase upsert on composite unique constraint requires specifying the columns.
  for (const limit of limits) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from("plan_limits").upsert(limit as any, { onConflict: "plan_id,limit_type" });
  }

  // Define Plan Features Junction
  const planFeatures = [
    { plan_id: planMap["professional"], feature_id: featureMap["whatsapp_rule_bot"] },
    { plan_id: planMap["advanced"], feature_id: featureMap["whatsapp_ai_bot"] },
    { plan_id: planMap["advanced"], feature_id: featureMap["offline_desktop_app"] },
    { plan_id: planMap["advanced"], feature_id: featureMap["clinic_website"] },
    { plan_id: planMap["offline"], feature_id: featureMap["offline_desktop_app"] },
  ];

  for (const pf of planFeatures) {
    if (pf.feature_id) {
       await supabase.from("plan_features").upsert(pf, { onConflict: "plan_id,feature_id" });
    }
  }

  // Also pre-seed a couple of clinic types just to have some
  await supabase.from("clinic_types").upsert([
    { code: "dental", name_en: "Dental", name_ar: "أسنان" },
    { code: "medical_center", name_en: "Medical Center", name_ar: "مركز طبي" },
    { code: "dermatology", name_en: "Dermatology", name_ar: "جلدية" },
  ], { onConflict: "code" });

  revalidatePath("/plans");
  revalidatePath("/features");
  revalidatePath("/clinic-types");
  
  return NextResponse.redirect(new URL("/plans", request.url));
}
