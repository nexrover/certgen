-- Migration: Add custom_layouts to brand_kits and create user_assets table for uploaded assets.
-- Run this SQL query manually in your Supabase SQL Editor if needed.

-- 1. Add custom_layouts column to brand_kits table
ALTER TABLE public.brand_kits
ADD COLUMN IF NOT EXISTS custom_layouts JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Create the user_assets table for custom uploaded images/elements
CREATE TABLE IF NOT EXISTS public.user_assets (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    url         TEXT        NOT NULL,
    path        TEXT        NOT NULL,
    mime_type   TEXT,
    size        INTEGER,
    kind        TEXT        NOT NULL CHECK (kind IN ('image', 'element', 'logo')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS and create security policies
ALTER TABLE public.user_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual read access to owner only"
    ON public.user_assets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users own rows"
    ON public.user_assets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow delete for owner only"
    ON public.user_assets FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_assets_updated_at ON public.user_assets;
CREATE TRIGGER trigger_user_assets_updated_at
    BEFORE UPDATE ON public.user_assets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_assets_updated_at();
