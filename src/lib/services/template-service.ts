import { createAdminClient } from "@/lib/supabase/admin";
import { TemplateNotFoundError } from "@/lib/errors";
import type { CertificateTemplate } from "@/lib/types";
import type { CreateTemplateInput, SaveBuilderTemplateInput } from "@/lib/schemas";

const TABLE = "certificate_templates";

export async function createTemplate(
  input: CreateTemplateInput
): Promise<CertificateTemplate> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: input.name,
      width: input.width ?? 1920,
      height: input.height ?? 1080,
      background_url: input.backgroundUrl ?? null,
      fields: input.fields,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create template: ${error.message}`);
  return data as CertificateTemplate;
}

export async function saveBuilderTemplate(
  input: SaveBuilderTemplateInput,
  existingId?: string
): Promise<CertificateTemplate> {
  const supabase = createAdminClient();
  const row = {
    name: input.name,
    width: input.width,
    height: input.height,
    paper_size: input.paperSize,
    canvas_json: input.canvasJson,
    background_url: input.backgroundUrl ?? null,
    fields: [],
  };

  if (existingId) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq("id", existingId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update template: ${error.message}`);
    return data as CertificateTemplate;
  }

  const { data, error } = await supabase.from(TABLE).insert(row).select().single();
  if (error) throw new Error(`Failed to create template: ${error.message}`);
  return data as CertificateTemplate;
}

export async function getTemplateById(
  id: string
): Promise<CertificateTemplate> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) throw new TemplateNotFoundError(id);
  return data as CertificateTemplate;
}

export async function listTemplates(): Promise<CertificateTemplate[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list templates: ${error.message}`);
  return (data ?? []) as CertificateTemplate[];
}

export async function deleteTemplateById(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) throw new Error(`Failed to delete template: ${error.message}`);
}
