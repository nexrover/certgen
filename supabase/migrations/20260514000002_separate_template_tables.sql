-- SQL to create separate template tables for each category

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 1920,
    height INTEGER NOT NULL DEFAULT 1080,
    background_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    canvas_json JSONB,
    paper_size TEXT NOT NULL DEFAULT 'A4',
    category TEXT NOT NULL DEFAULT 'email',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own email_templates" ON email_templates FOR ALL USING (auth.uid() = user_id);

-- YouTube Templates
CREATE TABLE IF NOT EXISTS youtube_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 1280,
    height INTEGER NOT NULL DEFAULT 720,
    background_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    canvas_json JSONB,
    paper_size TEXT NOT NULL DEFAULT 'YOUTUBE_THUMBNAIL',
    category TEXT NOT NULL DEFAULT 'youtube',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE youtube_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own youtube_templates" ON youtube_templates FOR ALL USING (auth.uid() = user_id);

-- E-commerce Templates
CREATE TABLE IF NOT EXISTS ecommerce_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 1920,
    height INTEGER NOT NULL DEFAULT 1080,
    background_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    canvas_json JSONB,
    paper_size TEXT NOT NULL DEFAULT 'CUSTOM_16_9',
    category TEXT NOT NULL DEFAULT 'ecommerce',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE ecommerce_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own ecommerce_templates" ON ecommerce_templates FOR ALL USING (auth.uid() = user_id);

-- Real Estate Templates
CREATE TABLE IF NOT EXISTS real_estate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 842,
    height INTEGER NOT NULL DEFAULT 595,
    background_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    canvas_json JSONB,
    paper_size TEXT NOT NULL DEFAULT 'A4_LANDSCAPE',
    category TEXT NOT NULL DEFAULT 'real-estate',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE real_estate_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own real_estate_templates" ON real_estate_templates FOR ALL USING (auth.uid() = user_id);

-- Shipping Label Templates
CREATE TABLE IF NOT EXISTS shipping_label_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 792,
    height INTEGER NOT NULL DEFAULT 612,
    background_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    canvas_json JSONB,
    paper_size TEXT NOT NULL DEFAULT 'US_LETTER_LANDSCAPE',
    category TEXT NOT NULL DEFAULT 'shipping-label',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE shipping_label_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own shipping_label_templates" ON shipping_label_templates FOR ALL USING (auth.uid() = user_id);

-- Resume Templates
CREATE TABLE IF NOT EXISTS resume_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 595,
    height INTEGER NOT NULL DEFAULT 842,
    background_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    canvas_json JSONB,
    paper_size TEXT NOT NULL DEFAULT 'A4',
    category TEXT NOT NULL DEFAULT 'resume',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE resume_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own resume_templates" ON resume_templates FOR ALL USING (auth.uid() = user_id);

-- Open Graph Templates
CREATE TABLE IF NOT EXISTS open_graph_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 1200,
    height INTEGER NOT NULL DEFAULT 630,
    background_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    canvas_json JSONB,
    paper_size TEXT NOT NULL DEFAULT 'OG_IMAGE',
    category TEXT NOT NULL DEFAULT 'open-graph',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE open_graph_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own open_graph_templates" ON open_graph_templates FOR ALL USING (auth.uid() = user_id);

-- Christmas Card Templates
CREATE TABLE IF NOT EXISTS christmas_card_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 595,
    height INTEGER NOT NULL DEFAULT 842,
    background_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    canvas_json JSONB,
    paper_size TEXT NOT NULL DEFAULT 'A4',
    category TEXT NOT NULL DEFAULT 'christmas-card',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE christmas_card_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own christmas_card_templates" ON christmas_card_templates FOR ALL USING (auth.uid() = user_id);

-- Social Media Templates
CREATE TABLE IF NOT EXISTS social_media_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 1080,
    height INTEGER NOT NULL DEFAULT 1080,
    background_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    canvas_json JSONB,
    paper_size TEXT NOT NULL DEFAULT 'SOCIAL_1080',
    category TEXT NOT NULL DEFAULT 'social-media',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE social_media_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own social_media_templates" ON social_media_templates FOR ALL USING (auth.uid() = user_id);

-- Receipt Templates
CREATE TABLE IF NOT EXISTS receipt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 612,
    height INTEGER NOT NULL DEFAULT 792,
    background_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    canvas_json JSONB,
    paper_size TEXT NOT NULL DEFAULT 'US_LETTER',
    category TEXT NOT NULL DEFAULT 'receipt',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE receipt_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own receipt_templates" ON receipt_templates FOR ALL USING (auth.uid() = user_id);

-- Invoice Templates
CREATE TABLE IF NOT EXISTS invoice_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 595,
    height INTEGER NOT NULL DEFAULT 842,
    background_url TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    canvas_json JSONB,
    paper_size TEXT NOT NULL DEFAULT 'A4',
    category TEXT NOT NULL DEFAULT 'invoice',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own invoice_templates" ON invoice_templates FOR ALL USING (auth.uid() = user_id);
