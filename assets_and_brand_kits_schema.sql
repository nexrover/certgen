-- ============================================================
-- Migration: Complete Brand Kits & User Assets Setup
-- ============================================================

-- 0. Drop existing tables if requested to "remove existing table and fix it"
DROP TABLE IF EXISTS public.brand_kits CASCADE;
DROP TABLE IF EXISTS public.user_assets CASCADE;

-- 1. Create the brand_kits table
CREATE TABLE IF NOT EXISTS public.brand_kits (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
    colors      TEXT[]      NOT NULL DEFAULT '{}' CHECK (array_length(colors, 1) IS NULL OR array_length(colors, 1) <= 12),
    typography  JSONB       NOT NULL DEFAULT '{}'::jsonb,
    logos       TEXT[]      NOT NULL DEFAULT '{}' CHECK (array_length(logos, 1) IS NULL OR array_length(logos, 1) <= 10),
    graphics    TEXT[]      NOT NULL DEFAULT '{}',
    photos      TEXT[]      NOT NULL DEFAULT '{}',
    elements    TEXT[]      NOT NULL DEFAULT '{}',
    custom_layouts JSONB    NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_kits_user_id ON public.brand_kits(user_id);

ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual read access to owner only (brand_kits)"
    ON public.brand_kits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users own rows (brand_kits)"
    ON public.brand_kits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update for owner only (brand_kits)"
    ON public.brand_kits FOR UPDATE
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow delete for owner only (brand_kits)"
    ON public.brand_kits FOR DELETE
    USING (auth.uid() = user_id);

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

ALTER TABLE public.user_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual read access to owner only (user_assets)"
    ON public.user_assets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users own rows (user_assets)"
    ON public.user_assets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow delete for owner only (user_assets)"
    ON public.user_assets FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_brand_kits_updated_at ON public.brand_kits;
CREATE TRIGGER trigger_brand_kits_updated_at
    BEFORE UPDATE ON public.brand_kits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamps();

DROP TRIGGER IF EXISTS trigger_user_assets_updated_at ON public.user_assets;
CREATE TRIGGER trigger_user_assets_updated_at
    BEFORE UPDATE ON public.user_assets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamps();
