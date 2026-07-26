DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'serial_status') THEN
    CREATE TYPE public.serial_status AS ENUM ('unused', 'used', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.clinic_serials (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    code text NOT NULL,
    plan_id uuid NOT NULL,
    status public.serial_status NOT NULL DEFAULT 'unused',
    clinic_id uuid,
    created_by uuid NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT clinic_serials_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_serials_code_key UNIQUE (code),
    CONSTRAINT clinic_serials_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE RESTRICT,
    CONSTRAINT clinic_serials_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE SET NULL,
    CONSTRAINT clinic_serials_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.platform_admins(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_clinic_serials_code ON public.clinic_serials(code);
CREATE INDEX IF NOT EXISTS idx_clinic_serials_status ON public.clinic_serials(status);
CREATE INDEX IF NOT EXISTS idx_clinic_serials_plan_id ON public.clinic_serials(plan_id);

ALTER TABLE public.clinic_serials ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view clinic_serials' AND tablename = 'clinic_serials') THEN
    CREATE POLICY "Admins can view clinic_serials" ON public.clinic_serials
        FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admins can manage clinic_serials' AND tablename = 'clinic_serials') THEN
    CREATE POLICY "Super admins can manage clinic_serials" ON public.clinic_serials
        FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'))
        WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can activate serials' AND tablename = 'clinic_serials') THEN
    CREATE POLICY "Service role can activate serials" ON public.clinic_serials
        FOR UPDATE TO service_role
        USING (true)
        WITH CHECK (true);
  END IF;
END $$;
