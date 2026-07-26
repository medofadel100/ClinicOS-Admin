CREATE TYPE public.serial_status AS ENUM ('unused', 'used', 'cancelled');

CREATE TABLE public.clinic_serials (
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

CREATE INDEX idx_clinic_serials_code ON public.clinic_serials(code);
CREATE INDEX idx_clinic_serials_status ON public.clinic_serials(status);
CREATE INDEX idx_clinic_serials_plan_id ON public.clinic_serials(plan_id);

ALTER TABLE public.clinic_serials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view clinic_serials" ON public.clinic_serials
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can manage clinic_serials" ON public.clinic_serials
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Service role can activate serials" ON public.clinic_serials
    FOR UPDATE TO service_role
    USING (true)
    WITH CHECK (true);
