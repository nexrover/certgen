-- Add category column to certificate_templates
ALTER TABLE public.certificate_templates ADD COLUMN IF NOT EXISTS category text DEFAULT 'certificate';
