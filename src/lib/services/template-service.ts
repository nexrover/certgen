import { createClient } from "@/lib/supabase/server";
import { TemplateNotFoundError } from "@/lib/errors";
import type { CertificateTemplate } from "@/lib/types";
import type { CreateTemplateInput, SaveBuilderTemplateInput } from "@/lib/schemas";

const TABLE = "certificate_templates";

export async function createTemplate(
  input: CreateTemplateInput,
  userId: string
): Promise<CertificateTemplate> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      name: input.name,
      width: input.width ?? 1920,
      height: input.height ?? 1080,
      background_url: input.backgroundUrl ?? null,
      category: "certificate", // Default for simple creation
      fields: input.fields,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create template: ${error.message}`);
  return data as CertificateTemplate;
}

export async function saveBuilderTemplate(
  input: SaveBuilderTemplateInput,
  userId: string,
  existingId?: string
): Promise<CertificateTemplate> {
  const supabase = await createClient();
  const row = {
    user_id: userId,
    name: input.name,
    width: input.width,
    height: input.height,
    paper_size: input.paperSize,
    canvas_json: input.canvasJson,
    background_url: input.backgroundUrl ?? null,
    category: input.category ?? "certificate",
    fields: [],
  };

  if (existingId) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq("id", existingId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      // Fallback for missing 'category' column in older schema
      if (error.message.includes("column \"category\" of relation \"certificate_templates\" does not exist")) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { category, ...rest } = row;
        const { data: retryData, error: retryError } = await supabase
          .from(TABLE)
          .update(rest)
          .eq("id", existingId)
          .eq("user_id", userId)
          .select()
          .single();
        if (retryError) throw new Error(`Failed to update template: ${retryError.message}`);
        return retryData as CertificateTemplate;
      }
      throw new Error(`Failed to update template: ${error.message}`);
    }
    return data as CertificateTemplate;
  }

  const { data, error } = await supabase.from(TABLE).insert(row).select().single();
  if (error) {
    // Fallback for missing 'category' column in older schema
    if (error.message.includes("column \"category\" of relation \"certificate_templates\" does not exist") || 
        error.message.includes("Could not find the 'category' column")) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { category, ...rest } = row;
      const { data: retryData, error: retryError } = await supabase
        .from(TABLE)
        .insert(rest)
        .select()
        .single();
      if (retryError) throw new Error(`Failed to create template: ${retryError.message}`);
      return retryData as CertificateTemplate;
    }
    throw new Error(`Failed to create template: ${error.message}`);
  }
  return data as CertificateTemplate;
}

export async function getTemplateById(
  id: string,
  userId: string
): Promise<CertificateTemplate> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new TemplateNotFoundError(id);
  return data as CertificateTemplate;
}

export async function listTemplates(userId: string): Promise<CertificateTemplate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list templates: ${error.message}`);
  return (data ?? []) as CertificateTemplate[];
}

export async function deleteTemplateById(id: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from(TABLE).delete().eq("id", id).eq("user_id", userId);

  if (error) throw new Error(`Failed to delete template: ${error.message}`);
}

export async function renameTemplate(
  id: string,
  userId: string,
  newName: string
): Promise<CertificateTemplate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ name: newName })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to rename template: ${error.message}`);
  return data as CertificateTemplate;
}

export async function duplicateTemplate(
  id: string,
  userId: string
): Promise<CertificateTemplate> {
  const supabase = await createClient();
  
  // 1. Fetch the original
  const { data: original, error: fetchError } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !original) {
    throw new Error(`Failed to fetch original template: ${fetchError?.message || "Not found"}`);
  }

  // 2. Insert as a new row (Supabase will generate a new ID)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _, created_at: __, ...rest } = original;
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      ...rest,
      name: `${original.name} (Copy)`,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to duplicate template: ${error.message}`);
  return data as CertificateTemplate;
}
