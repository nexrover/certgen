import { createClient } from "@/lib/supabase/server";
import { TemplateNotFoundError } from "@/lib/errors";
import type { CertificateTemplate } from "@/lib/types";
import type { CreateTemplateInput, SaveBuilderTemplateInput } from "@/lib/schemas";
import { getTableName } from "@/lib/template-categories";

const DEFAULT_TABLE = "certificate_templates";

export async function createTemplate(
  input: CreateTemplateInput,
  userId: string,
  category: string = "certificate"
): Promise<CertificateTemplate> {
  const supabase = await createClient();
  const table = getTableName(category);

  const { data, error } = await supabase
    .from(table)
    .insert({
      user_id: userId,
      name: input.name,
      width: input.width ?? 1920,
      height: input.height ?? 1080,
      background_url: input.backgroundUrl ?? null,
      category,
      fields: input.fields,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create template in ${table}: ${error.message}`);
  return data as CertificateTemplate;
}

export async function saveBuilderTemplate(
  input: SaveBuilderTemplateInput,
  userId: string,
  existingId?: string
): Promise<CertificateTemplate> {
  const supabase = await createClient();
  const category = input.category ?? "certificate";
  const table = getTableName(category);

  const row = {
    user_id: userId,
    name: input.name,
    width: input.width,
    height: input.height,
    paper_size: input.paperSize,
    canvas_json: input.canvasJson,
    background_url: input.backgroundUrl ?? null,
    category,
    fields: [],
  };

  if (existingId) {
    const { data, error } = await supabase
      .from(table)
      .update(row)
      .eq("id", existingId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update template in ${table}: ${error.message}`);
    }
    return data as CertificateTemplate;
  }

  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) {
    throw new Error(`Failed to create template in ${table}: ${error.message}`);
  }
  return data as CertificateTemplate;
}

export async function getTemplateById(
  id: string,
  userId: string,
  category?: string
): Promise<CertificateTemplate> {
  const supabase = await createClient();
  const table = getTableName(category);

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new TemplateNotFoundError(id);
  return data as CertificateTemplate;
}

export async function listTemplates(
  userId: string,
  category?: string
): Promise<CertificateTemplate[]> {
  const supabase = await createClient();
  const table = getTableName(category);

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list templates from ${table}: ${error.message}`);
  return (data ?? []) as CertificateTemplate[];
}

export async function deleteTemplateById(
  id: string,
  userId: string,
  category?: string
): Promise<void> {
  const supabase = await createClient();
  const table = getTableName(category);
  const { error } = await supabase.from(table).delete().eq("id", id).eq("user_id", userId);

  if (error) throw new Error(`Failed to delete template from ${table}: ${error.message}`);
}

export async function renameTemplate(
  id: string,
  userId: string,
  newName: string,
  category?: string
): Promise<CertificateTemplate> {
  const supabase = await createClient();
  const table = getTableName(category);
  const { data, error } = await supabase
    .from(table)
    .update({ name: newName })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to rename template in ${table}: ${error.message}`);
  return data as CertificateTemplate;
}

export async function duplicateTemplate(
  id: string,
  userId: string,
  category?: string
): Promise<CertificateTemplate> {
  const supabase = await createClient();
  const table = getTableName(category);
  
  // 1. Fetch the original
  const { data: original, error: fetchError } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !original) {
    throw new Error(`Failed to fetch original template from ${table}: ${fetchError?.message || "Not found"}`);
  }

  // 2. Insert as a new row (Supabase will generate a new ID)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _, created_at: __, ...rest } = original;
  const { data, error } = await supabase
    .from(table)
    .insert({
      ...rest,
      name: `${original.name} (Copy)`,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to duplicate template in ${table}: ${error.message}`);
  return data as CertificateTemplate;
}
