-- =====================================================
-- ClinicOS Subscription Plans & Features Seed
-- =====================================================

-- Step 1: Clean old plan data (order matters due to FKs)
DELETE FROM public.plan_features;
DELETE FROM public.plan_limits;
DELETE FROM public.plans;
DELETE FROM public.features WHERE code IN (
  'emr','appointments','billing','prescriptions','sms_reminders',
  'patient_portal','whatsapp','online_booking','doctor_management',
  'staff_management','inventory','analytics','audit_log',
  'telehealth','multi_branch'
);

-- =====================================================
-- Step 2: Insert Features (15 features)
-- =====================================================

-- CORE: الأساسيات
INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000001', 'emr',
 'السجلات الطبية الإلكترونية', 'Electronic Medical Records',
 'إدارة سجلات المرضى الإلكترونية بشكل كامل', 'Full electronic patient records management',
 'core', 0, true);

INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000002', 'appointments',
 'جدولة المواعيد', 'Appointment Scheduling',
 'نظام ذكي لجدولة وإدارة مواعيد المرضى', 'Smart appointment scheduling and management',
 'core', 0, true);

INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000003', 'billing',
 'الفواتير والمدفوعات', 'Billing & Invoicing',
 'نظام فواتير ومتابعة المدفوعات', 'Billing and payment tracking system',
 'core', 0, true);

INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000004', 'prescriptions',
 'الوصفات الإلكترونية', 'e-Prescriptions',
 'كتابة وإدارة الوصفات الطبية إلكترونياً', 'Electronic prescription writing and management',
 'core', 200, true);

-- COMMUNICATION: التواصل
INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000005', 'sms_reminders',
 'تذكيرات SMS', 'SMS Reminders',
 'إرسال تذكيرات تلقائية للمرضى عبر SMS', 'Automated SMS reminders for patients',
 'communication', 150, true);

INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000006', 'patient_portal',
 'بوابة المرضى', 'Patient Portal',
 'بوابة أونلاين للمرضى لحجز المواعيد وعرض السجلات', 'Online portal for patients to book appointments and view records',
 'communication', 250, true);

INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000007', 'whatsapp',
 'تكامل واتساب', 'WhatsApp Integration',
 'إرسال مواعيد وتذكيرات عبر واتساب', 'Send appointments and reminders via WhatsApp',
 'communication', 350, true);

INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000008', 'online_booking',
 'الحجز أونلاين', 'Online Booking',
 'نظام حجز أونلاين للمرضى من الموقع أو التطبيق', 'Online booking system for patients via website or app',
 'communication', 300, true);

-- MANAGEMENT: الإدارة
INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000009', 'doctor_management',
 'إدارة الأطباء', 'Doctor Management',
 'إدارة حسابات الأطباء والجداول والتصنيفات', 'Manage doctor accounts, schedules, and specializations',
 'management', 0, true);

INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000010', 'staff_management',
 'إدارة الموظفين', 'Staff Management',
 'إدارة حسابات الموظفين والصلاحيات', 'Manage staff accounts and permissions',
 'management', 0, true);

INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000011', 'inventory',
 'إدارة المخزون', 'Inventory Management',
 'تتبع إدارة مخزون الأدوية والإمدادات', 'Track and manage medicine and supply inventory',
 'management', 200, true);

-- ANALYTICS: التحليلات
INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000012', 'analytics',
 'التقارير والتحليلات', 'Analytics & Reports',
 'تقارير شاملة عن الأداء والإيرادات والمرضى', 'Comprehensive reports on performance, revenue, and patients',
 'analytics', 300, true);

INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000013', 'audit_log',
 'سجل المراجعات', 'Audit Log',
 'تتبع كل التغييرات والأفعال في النظام', 'Track all changes and actions in the system',
 'analytics', 150, true);

-- ADVANCED: متقدمة
INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000014', 'telehealth',
 'التطبيب عن بعد', 'Telehealth',
 'مكالمات فيديو مع المرضى عن بعد', 'Video calls with patients remotely',
 'advanced', 500, true);

INSERT INTO public.features (id, code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active) VALUES
('f0000001-0000-0000-0000-000000000015', 'multi_branch',
 'الفروع المتعددة', 'Multi-Branch Support',
 'إدارة أكثر من فرع من مكان واحد', 'Manage multiple branches from one place',
 'advanced', 800, true);

-- =====================================================
-- Step 3: Insert Offline Plans (للعيادات الأوفلاين)
-- =====================================================

-- Offline Starter
INSERT INTO public.plans (id, code, name_ar, name_en, price_egp, billing_cycle, is_active) VALUES
('a0000001-0000-0000-0000-000000000001', 'offline-starter',
 'أوفلاين ستارتر', 'Offline Starter',
 1800, 'yearly', true);

-- Offline Plus
INSERT INTO public.plans (id, code, name_ar, name_en, price_egp, billing_cycle, is_active) VALUES
('a0000001-0000-0000-0000-000000000002', 'offline-plus',
 'أوفلاين بلس', 'Offline Plus',
 3300, 'yearly', true);

-- Offline Growth
INSERT INTO public.plans (id, code, name_ar, name_en, price_egp, billing_cycle, is_active) VALUES
('a0000001-0000-0000-0000-000000000003', 'offline-growth',
 'أوفلاين جروث', 'Offline Growth',
 5400, 'yearly', true);

-- Offline Enterprise
INSERT INTO public.plans (id, code, name_ar, name_en, price_egp, billing_cycle, is_active) VALUES
('a0000001-0000-0000-0000-000000000004', 'offline-enterprise',
 'أوفلاين إنتربرايز', 'Offline Enterprise',
 9000, 'yearly', true);

-- =====================================================
-- Step 4: Insert Online Plans (أونلاين + أوفلاين)
-- =====================================================

-- Starter (1 clinic)
INSERT INTO public.plans (id, code, name_ar, name_en, price_egp, billing_cycle, is_active) VALUES
('a0000001-0000-0000-0000-000000000011', 'starter',
 'باقة ستارتر', 'Starter',
 3600, 'yearly', true);

-- Plus (2-3 clinics)
INSERT INTO public.plans (id, code, name_ar, name_en, price_egp, billing_cycle, is_active) VALUES
('a0000001-0000-0000-0000-000000000012', 'plus',
 'باقة بلس', 'Plus',
 6600, 'yearly', true);

-- Growth (3-5 clinics)
INSERT INTO public.plans (id, code, name_ar, name_en, price_egp, billing_cycle, is_active) VALUES
('a0000001-0000-0000-0000-000000000013', 'growth',
 'باقة جروث', 'Growth',
 10800, 'yearly', true);

-- Enterprise (5+ clinics)
INSERT INTO public.plans (id, code, name_ar, name_en, price_egp, billing_cycle, is_active) VALUES
('a0000001-0000-0000-0000-000000000014', 'enterprise',
 'باقة إنتربرايز', 'Enterprise',
 18000, 'yearly', true);

-- =====================================================
-- Step 5: Link Features to Plans
-- =====================================================

-- OFFLINE STARTER: emr, appointments, billing, doctor_management
INSERT INTO public.plan_features (plan_id, feature_id) VALUES
('a0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001'),
('a0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000002'),
('a0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000003'),
('a0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000009');

-- OFFLINE PLUS: + prescriptions, inventory, staff_management
INSERT INTO public.plan_features (plan_id, feature_id) VALUES
('a0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000001'),
('a0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000002'),
('a0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000003'),
('a0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000004'),
('a0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000009'),
('a0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000010'),
('a0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000011');

-- OFFLINE GROWTH: + analytics, audit_log
INSERT INTO public.plan_features (plan_id, feature_id) VALUES
('a0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000001'),
('a0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000002'),
('a0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000003'),
('a0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000004'),
('a0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000009'),
('a0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000010'),
('a0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000011'),
('a0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000012'),
('a0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000013');

-- OFFLINE ENTERPRISE: + multi_branch
INSERT INTO public.plan_features (plan_id, feature_id) VALUES
('a0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000001'),
('a0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000002'),
('a0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000003'),
('a0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000004'),
('a0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000009'),
('a0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000010'),
('a0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000011'),
('a0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000012'),
('a0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000013'),
('a0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000015');

-- =====================================================
-- ONLINE PLANS
-- =====================================================

-- STARTER: emr, appointments, billing, prescriptions, doctor_management, online_booking, sms_reminders
INSERT INTO public.plan_features (plan_id, feature_id) VALUES
('a0000001-0000-0000-0000-000000000011', 'f0000001-0000-0000-0000-000000000001'),
('a0000001-0000-0000-0000-000000000011', 'f0000001-0000-0000-0000-000000000002'),
('a0000001-0000-0000-0000-000000000011', 'f0000001-0000-0000-0000-000000000003'),
('a0000001-0000-0000-0000-000000000011', 'f0000001-0000-0000-0000-000000000004'),
('a0000001-0000-0000-0000-000000000011', 'f0000001-0000-0000-0000-000000000009'),
('a0000001-0000-0000-0000-000000000011', 'f0000001-0000-0000-0000-000000000005'),
('a0000001-0000-0000-0000-000000000011', 'f0000001-0000-0000-0000-000000000008');

-- PLUS: + patient_portal, inventory, analytics, staff_management
INSERT INTO public.plan_features (plan_id, feature_id) VALUES
('a0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000001'),
('a0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000002'),
('a0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000003'),
('a0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000004'),
('a0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000009'),
('a0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000010'),
('a0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000005'),
('a0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000006'),
('a0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000008'),
('a0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000011'),
('a0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000012');

-- GROWTH: + whatsapp, telehealth, audit_log
INSERT INTO public.plan_features (plan_id, feature_id) VALUES
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000001'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000002'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000003'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000004'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000009'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000010'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000005'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000006'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000007'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000008'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000011'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000012'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000013'),
('a0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000014');

-- ENTERPRISE: ALL features
INSERT INTO public.plan_features (plan_id, feature_id) VALUES
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000001'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000002'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000003'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000004'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000005'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000006'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000007'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000008'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000009'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000010'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000011'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000012'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000013'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000014'),
('a0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000015');

-- =====================================================
-- Step 6: Plan Limits (max values per plan)
-- =====================================================

-- OFFLINE STARTER
INSERT INTO public.plan_limits (plan_id, limit_type, max_value) VALUES
('a0000001-0000-0000-0000-000000000001', 'provider_seats', 1),
('a0000001-0000-0000-0000-000000000001', 'staff_accounts', 2),
('a0000001-0000-0000-0000-000000000001', 'patients', 500);

-- OFFLINE PLUS
INSERT INTO public.plan_limits (plan_id, limit_type, max_value) VALUES
('a0000001-0000-0000-0000-000000000002', 'provider_seats', 3),
('a0000001-0000-0000-0000-000000000002', 'staff_accounts', 5),
('a0000001-0000-0000-0000-000000000002', 'patients', 1500);

-- OFFLINE GROWTH
INSERT INTO public.plan_limits (plan_id, limit_type, max_value) VALUES
('a0000001-0000-0000-0000-000000000003', 'provider_seats', 5),
('a0000001-0000-0000-0000-000000000003', 'staff_accounts', 8),
('a0000001-0000-0000-0000-000000000003', 'patients', 3000);

-- OFFLINE ENTERPRISE
INSERT INTO public.plan_limits (plan_id, limit_type, max_value) VALUES
('a0000001-0000-0000-0000-000000000004', 'provider_seats', 8),
('a0000001-0000-0000-0000-000000000004', 'staff_accounts', 15),
('a0000001-0000-0000-0000-000000000004', 'patients', 7500);

-- STARTER (Online)
INSERT INTO public.plan_limits (plan_id, limit_type, max_value) VALUES
('a0000001-0000-0000-0000-000000000011', 'provider_seats', 2),
('a0000001-0000-0000-0000-000000000011', 'staff_accounts', 3),
('a0000001-0000-0000-0000-000000000011', 'patients', 1000);

-- PLUS (Online)
INSERT INTO public.plan_limits (plan_id, limit_type, max_value) VALUES
('a0000001-0000-0000-0000-000000000012', 'provider_seats', 4),
('a0000001-0000-0000-0000-000000000012', 'staff_accounts', 6),
('a0000001-0000-0000-0000-000000000012', 'patients', 3000);

-- GROWTH (Online)
INSERT INTO public.plan_limits (plan_id, limit_type, max_value) VALUES
('a0000001-0000-0000-0000-000000000013', 'provider_seats', 8),
('a0000001-0000-0000-0000-000000000013', 'staff_accounts', 12),
('a0000001-0000-0000-0000-000000000013', 'patients', 7500);

-- ENTERPRISE (Online)
INSERT INTO public.plan_limits (plan_id, limit_type, max_value) VALUES
('a0000001-0000-0000-0000-000000000014', 'provider_seats', 15),
('a0000001-0000-0000-0000-000000000014', 'staff_accounts', 25),
('a0000001-0000-0000-0000-000000000014', 'patients', 15000);

-- =====================================================
-- Done!
-- =====================================================
