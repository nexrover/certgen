-- Ensure category column exists in certificate_templates
ALTER TABLE public.certificate_templates ADD COLUMN IF NOT EXISTS category text DEFAULT 'certificate';

-- Ensure category column exists in certificates (issued)
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS category text DEFAULT 'certificate';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_certificate_templates_category ON public.certificate_templates(category);
CREATE INDEX IF NOT EXISTS idx_certificates_category ON public.certificates(category);
