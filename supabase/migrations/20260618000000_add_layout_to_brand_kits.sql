-- Migration: Add layout column to brand_kits table
-- Run this SQL query manually in your Supabase SQL Editor.
ALTER TABLE public.brand_kits
ADD COLUMN IF NOT EXISTS layout JSONB NOT NULL DEFAULT '{}'::jsonb;
