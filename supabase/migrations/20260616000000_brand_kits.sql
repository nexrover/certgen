-- ============================================================
-- Migration: brand_kits table with strict Row Level Security
-- Purpose:   Multi-tenant data isolation for AI Design Assistant
--            brand kit presets (color palettes, typography, logos,
--            graphics, photos, elements).
-- ============================================================

-- 1. Create the brand_kits table
CREATE TABLE IF NOT EXISTS public.brand_kits (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Display name for the brand kit preset
    name        TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),

    -- Color palette: ordered array of hex color strings, max 12 colors
    colors      TEXT[]      NOT NULL DEFAULT '{}' CHECK (array_length(colors, 1) IS NULL OR array_length(colors, 1) <= 12),

    -- Typography hierarchy stored as JSONB
    -- Expected shape: { "title": "Inter", "subtitle": "Roboto", "body": "Open Sans" }
    typography  JSONB       NOT NULL DEFAULT '{}'::jsonb,

    -- Logo URLs array (max 10 logos per kit)
    logos       TEXT[]      NOT NULL DEFAULT '{}' CHECK (array_length(logos, 1) IS NULL OR array_length(logos, 1) <= 10),

    -- Graphics asset URLs
    graphics    TEXT[]      NOT NULL DEFAULT '{}',

    -- Photo asset URLs
    photos      TEXT[]      NOT NULL DEFAULT '{}',

    -- Element/sticker asset URLs
    elements    TEXT[]      NOT NULL DEFAULT '{}',

    -- Timestamps
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index for fast user-scoped queries
CREATE INDEX IF NOT EXISTS idx_brand_kits_user_id ON public.brand_kits(user_id);

-- 3. Enable Row Level Security
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — strict owner-only access (multi-tenant isolation)

-- SELECT: Allow individual read access to owner only
CREATE POLICY "Allow individual read access to owner only"
    ON public.brand_kits FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Only authenticated users can insert their own rows
CREATE POLICY "Allow insert for authenticated users own rows"
    ON public.brand_kits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Owner can only update their own brand kits
CREATE POLICY "Allow update for owner only"
    ON public.brand_kits FOR UPDATE
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Owner can only delete their own brand kits
CREATE POLICY "Allow delete for owner only"
    ON public.brand_kits FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_brand_kits_updated_at()
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
    EXECUTE FUNCTION public.update_brand_kits_updated_at();
