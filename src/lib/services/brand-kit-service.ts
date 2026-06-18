import { createClient } from "@/lib/supabase/server";
import type { BrandKit, BrandKitTypography, BrandKitLayout } from "@/lib/types";

const TABLE = "brand_kits";

export interface CreateBrandKitInput {
  name: string;
  colors?: string[];
  typography?: BrandKitTypography;
  logos?: string[];
  graphics?: string[];
  photos?: string[];
  elements?: string[];
  layout?: BrandKitLayout;
}

export interface UpdateBrandKitInput {
  name?: string;
  colors?: string[];
  typography?: BrandKitTypography;
  logos?: string[];
  graphics?: string[];
  photos?: string[];
  elements?: string[];
  layout?: BrandKitLayout;
}

/**
 * List all brand kits for the authenticated user.
 * RLS ensures only the owner's kits are returned.
 */
export async function listBrandKits(userId: string): Promise<BrandKit[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list brand kits: ${error.message}`);
  return (data ?? []) as BrandKit[];
}

/**
 * Get a single brand kit by ID (owner-scoped).
 */
export async function getBrandKitById(
  id: string,
  userId: string
): Promise<BrandKit> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new Error(`Brand kit not found: ${id}`);
  return data as BrandKit;
}

/**
 * Create a new brand kit for the authenticated user.
 */
export async function createBrandKit(
  input: CreateBrandKitInput,
  userId: string
): Promise<BrandKit> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      name: input.name,
      colors: input.colors ?? [],
      typography: input.typography ?? {},
      logos: input.logos ?? [],
      graphics: input.graphics ?? [],
      photos: input.photos ?? [],
      elements: input.elements ?? [],
      layout: input.layout ?? {},
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create brand kit: ${error.message}`);
  return data as BrandKit;
}

/**
 * Update an existing brand kit (owner-scoped).
 */
export async function updateBrandKit(
  id: string,
  userId: string,
  input: UpdateBrandKitInput
): Promise<BrandKit> {
  const supabase = await createClient();

  // Build partial update payload — only include provided fields
  const updatePayload: Record<string, unknown> = {};
  if (input.name !== undefined) updatePayload.name = input.name;
  if (input.colors !== undefined) updatePayload.colors = input.colors;
  if (input.typography !== undefined) updatePayload.typography = input.typography;
  if (input.logos !== undefined) updatePayload.logos = input.logos;
  if (input.graphics !== undefined) updatePayload.graphics = input.graphics;
  if (input.photos !== undefined) updatePayload.photos = input.photos;
  if (input.elements !== undefined) updatePayload.elements = input.elements;
  if (input.layout !== undefined) updatePayload.layout = input.layout;

  const { data, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update brand kit: ${error.message}`);
  return data as BrandKit;
}

/**
 * Delete a brand kit (owner-scoped).
 */
export async function deleteBrandKit(
  id: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to delete brand kit: ${error.message}`);
}
