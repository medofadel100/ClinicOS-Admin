-- Add storage_mb to plan_limit_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'storage_mb' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'plan_limit_type')) THEN
    ALTER TYPE public.plan_limit_type ADD VALUE 'storage_mb';
  END IF;
END $$;

-- Table: clinic_settings (key-value store per clinic)
CREATE TABLE public.clinic_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL,
    setting_key text NOT NULL,
    setting_value text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT clinic_settings_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_settings_clinic_id_setting_key_key UNIQUE (clinic_id, setting_key),
    CONSTRAINT clinic_settings_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE
);

-- Table: patient_uploaded_files
CREATE TABLE public.patient_uploaded_files (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL,
    patient_id uuid,
    file_name text NOT NULL,
    file_size bigint NOT NULL,
    category text,
    storage_provider text DEFAULT 'supabase',
    storage_path text,
    mime_type text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT patient_uploaded_files_pkey PRIMARY KEY (id),
    CONSTRAINT patient_uploaded_files_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_patient_uploaded_files_clinic_id ON public.patient_uploaded_files(clinic_id);
CREATE INDEX idx_clinic_settings_clinic_id ON public.clinic_settings(clinic_id);

-- Enable RLS
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_uploaded_files ENABLE ROW LEVEL SECURITY;

-- RLS for clinic_settings
CREATE POLICY "Admins can view clinic_settings" ON public.clinic_settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins and accountants can manage clinic_settings" ON public.clinic_settings
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant')));

-- RLS for patient_uploaded_files
CREATE POLICY "Admins can view patient_uploaded_files" ON public.patient_uploaded_files
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins and accountants can manage patient_uploaded_files" ON public.patient_uploaded_files
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant')))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant')));
