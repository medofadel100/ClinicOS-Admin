-- Seed file for local development
-- WARNING: Running this via `supabase db reset` will wipe the database and apply these mock records.

-- 1. Create a Platform Admin (auth.users and platform_admins)
-- We insert a fake user into auth.users so local login works: email: admin@clinicos.com / password: password123
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, 
  phone, email_change_confirm_status, is_sso_user
) VALUES (
  '00000000-0000-0000-0000-000000000000', 
  '11111111-1111-1111-1111-111111111111', 
  'authenticated', 
  'authenticated', 
  'admin@clinicos.com', 
  crypt('password123', gen_salt('bf')), 
  now(), 
  '{"provider":"email","providers":["email"]}', 
  '{}', 
  FALSE, 
  now(), 
  now(), 
  NULL, 
  0, 
  FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.platform_admins (auth_user_id, full_name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'System Admin', 'super_admin')
ON CONFLICT (auth_user_id) DO NOTHING;

-- 2. Insert Clinic Types
INSERT INTO public.clinic_types (id, name_en, name_ar) VALUES
('c1000000-0000-0000-0000-000000000000', 'Dental', 'أسنان'),
('c2000000-0000-0000-0000-000000000000', 'Dermatology', 'جلدية'),
('c3000000-0000-0000-0000-000000000000', 'Pediatrics', 'أطفال'),
('c4000000-0000-0000-0000-000000000000', 'Orthopedics', 'عظام'),
('c5000000-0000-0000-0000-000000000000', 'General Practice', 'ممارسة عامة')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Features
INSERT INTO public.features (id, name_en, name_ar, description_en, base_price_egp, is_active) VALUES
('f1000000-0000-0000-0000-000000000000', 'Electronic Medical Records (EMR)', 'السجلات الطبية الإلكترونية', 'Full EMR management system', 0, true),
('f2000000-0000-0000-0000-000000000000', 'e-Prescriptions', 'الوصفات الطبية الإلكترونية', 'Send prescriptions directly to pharmacies', 200.00, true),
('f3000000-0000-0000-0000-000000000000', 'Appointment Scheduling', 'جدولة المواعيد', 'Advanced calendar and scheduling', 0, true),
('f4000000-0000-0000-0000-000000000000', 'Patient Portal', 'بوابة المرضى', 'Allow patients to log in and view records', 150.00, true),
('f5000000-0000-0000-0000-000000000000', 'Billing & Invoicing', 'الفواتير والمدفوعات', 'Integrated billing system', 0, true),
('f6000000-0000-0000-0000-000000000000', 'Analytics & Reports', 'التحليلات والتقارير', 'Advanced analytics dashboard', 300.00, true),
('f7000000-0000-0000-0000-000000000000', 'Telehealth', 'الطب الاتصالي', 'Video consultation capabilities', 500.00, true),
('f8000000-0000-0000-0000-000000000000', 'SMS Reminders', 'رسائل التذكير', 'Automated SMS appointment reminders', 100.00, true),
('f9000000-0000-0000-0000-000000000000', 'Inventory Management', 'إدارة المخزون', 'Track clinic supplies and inventory', 250.00, true),
('f1000000-0000-0000-0000-000000000001', 'Multi-Branch Support', 'دعم الفروع المتعددة', 'Manage multiple clinic locations', 800.00, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Plans
INSERT INTO public.plans (id, name_en, name_ar, description_en, price_egp, max_users, max_patients, max_storage_gb, is_active) VALUES
('p1000000-0000-0000-0000-000000000000', 'Basic', 'الأساسي', 'For solo practitioners', 1000.00, 1, 500, 10, true),
('p2000000-0000-0000-0000-000000000000', 'Pro', 'المحترف', 'For growing clinics', 2500.00, 5, 2000, 50, true),
('p3000000-0000-0000-0000-000000000000', 'Enterprise', 'الشركات', 'For large hospitals', 6000.00, 20, 10000, 200, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Map Features to Plans
INSERT INTO public.plan_features (plan_id, feature_id) VALUES
('p1000000-0000-0000-0000-000000000000', 'f1000000-0000-0000-0000-000000000000'), -- Basic: EMR
('p1000000-0000-0000-0000-000000000000', 'f3000000-0000-0000-0000-000000000000'), -- Basic: Appointments
('p2000000-0000-0000-0000-000000000000', 'f1000000-0000-0000-0000-000000000000'), -- Pro: EMR
('p2000000-0000-0000-0000-000000000000', 'f2000000-0000-0000-0000-000000000000'), -- Pro: e-Prescriptions
('p2000000-0000-0000-0000-000000000000', 'f3000000-0000-0000-0000-000000000000'), -- Pro: Appointments
('p2000000-0000-0000-0000-000000000000', 'f5000000-0000-0000-0000-000000000000'), -- Pro: Billing
('p2000000-0000-0000-0000-000000000000', 'f8000000-0000-0000-0000-000000000000'), -- Pro: SMS
('p3000000-0000-0000-0000-000000000000', 'f1000000-0000-0000-0000-000000000000'), -- Ent: EMR
('p3000000-0000-0000-0000-000000000000', 'f2000000-0000-0000-0000-000000000000'), -- Ent: e-Prescriptions
('p3000000-0000-0000-0000-000000000000', 'f3000000-0000-0000-0000-000000000000'), -- Ent: Appointments
('p3000000-0000-0000-0000-000000000000', 'f4000000-0000-0000-0000-000000000000'), -- Ent: Patient Portal
('p3000000-0000-0000-0000-000000000000', 'f5000000-0000-0000-0000-000000000000'), -- Ent: Billing
('p3000000-0000-0000-0000-000000000000', 'f6000000-0000-0000-0000-000000000000'), -- Ent: Analytics
('p3000000-0000-0000-0000-000000000000', 'f7000000-0000-0000-0000-000000000000'), -- Ent: Telehealth
('p3000000-0000-0000-0000-000000000000', 'f8000000-0000-0000-0000-000000000000'), -- Ent: SMS
('p3000000-0000-0000-0000-000000000000', 'f9000000-0000-0000-0000-000000000000'), -- Ent: Inventory
('p3000000-0000-0000-0000-000000000000', 'f1000000-0000-0000-0000-000000000001')  -- Ent: Multi-Branch
ON CONFLICT DO NOTHING;

-- 6. Insert Mock Clinics
INSERT INTO public.clinics (id, name, domain_prefix, clinic_type_id, owner_email, owner_phone, owner_full_name, status) VALUES
('b1000000-0000-0000-0000-000000000000', 'Smile Dental Care', 'smile-dental', 'c1000000-0000-0000-0000-000000000000', 'owner@smiledental.com', '+201001234567', 'Dr. Ahmed Ali', 'active'),
('b2000000-0000-0000-0000-000000000000', 'Skin & Laser Clinic', 'skin-laser', 'c2000000-0000-0000-0000-000000000000', 'hello@skinlaser.com', '+201111234567', 'Dr. Sara Hassan', 'active'),
('b3000000-0000-0000-0000-000000000000', 'Happy Kids Pediatrics', 'happy-kids', 'c3000000-0000-0000-0000-000000000000', 'admin@happykids.com', '+201221234567', 'Dr. Mohamed Omar', 'trial'),
('b4000000-0000-0000-0000-000000000000', 'Bone & Joint Center', 'bone-joint', 'c4000000-0000-0000-0000-000000000000', 'info@bonecenter.com', '+201031234567', 'Dr. Youssef Kamal', 'inactive'),
('b5000000-0000-0000-0000-000000000000', 'Cairo General Hospital', 'cairo-general', 'c5000000-0000-0000-0000-000000000000', 'contact@cairogh.com', '+201041234567', 'Admin Team', 'active')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Subscriptions for the Clinics
INSERT INTO public.clinic_subscriptions (id, clinic_id, plan_id, status, current_period_start, current_period_end, trial_ends_at, price_locked_egp) VALUES
('s1000000-0000-0000-0000-000000000000', 'b1000000-0000-0000-0000-000000000000', 'p2000000-0000-0000-0000-000000000000', 'active', now() - interval '10 days', now() + interval '20 days', NULL, 2500.00),
('s2000000-0000-0000-0000-000000000000', 'b2000000-0000-0000-0000-000000000000', 'p2000000-0000-0000-0000-000000000000', 'active', now() - interval '5 days', now() + interval '25 days', NULL, 2500.00),
('s3000000-0000-0000-0000-000000000000', 'b3000000-0000-0000-0000-000000000000', 'p1000000-0000-0000-0000-000000000000', 'trial', now() - interval '2 days', now() + interval '28 days', now() + interval '12 days', 1000.00),
('s4000000-0000-0000-0000-000000000000', 'b4000000-0000-0000-0000-000000000000', 'p1000000-0000-0000-0000-000000000000', 'cancelled', now() - interval '60 days', now() - interval '30 days', NULL, 1000.00),
('s5000000-0000-0000-0000-000000000000', 'b5000000-0000-0000-0000-000000000000', 'p3000000-0000-0000-0000-000000000000', 'active', now() - interval '15 days', now() + interval '15 days', NULL, 6000.00)
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Feature Overrides (e.g., Cairo General gets Telehealth revoked, Smile Dental gets Telehealth granted)
-- Note: Admin ID is '11111111-1111-1111-1111-111111111111' but that's auth_user_id. The platform_admin table uses its own UUID.
-- We can fetch the ID using a nested query.
INSERT INTO public.account_feature_overrides (clinic_id, feature_id, override_type, granted_by_admin_id, note)
SELECT 'b5000000-0000-0000-0000-000000000000', 'f7000000-0000-0000-0000-000000000000', 'revoke', id, 'Revoked telehealth due to policy'
FROM public.platform_admins WHERE auth_user_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.account_feature_overrides (clinic_id, feature_id, override_type, granted_by_admin_id, note, price_addon_egp)
SELECT 'b1000000-0000-0000-0000-000000000000', 'f7000000-0000-0000-0000-000000000000', 'grant', id, 'Granted as addon', 400.00
FROM public.platform_admins WHERE auth_user_id = '11111111-1111-1111-1111-111111111111';

-- 9. Insert Payments
INSERT INTO public.payments (clinic_id, subscription_id, amount_egp, payment_method, status, recorded_by, reference_note)
SELECT 'b1000000-0000-0000-0000-000000000000', 's1000000-0000-0000-0000-000000000000', 2500.00, 'instapay', 'confirmed', id, 'Initial Pro Payment'
FROM public.platform_admins WHERE auth_user_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.payments (clinic_id, subscription_id, amount_egp, payment_method, status, recorded_by, reference_note)
SELECT 'b2000000-0000-0000-0000-000000000000', 's2000000-0000-0000-0000-000000000000', 2500.00, 'vodafone_cash', 'confirmed', id, 'Ref: 1928374'
FROM public.platform_admins WHERE auth_user_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.payments (clinic_id, subscription_id, amount_egp, payment_method, status, recorded_by, reference_note)
SELECT 'b5000000-0000-0000-0000-000000000000', 's5000000-0000-0000-0000-000000000000', 6000.00, 'bank_transfer', 'pending', id, 'Awaiting clearance'
FROM public.platform_admins WHERE auth_user_id = '11111111-1111-1111-1111-111111111111';
