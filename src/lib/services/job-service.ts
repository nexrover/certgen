import { createAdminClient } from "@/lib/supabase/admin";
import { JobNotFoundError } from "@/lib/errors";
import type { GenerationJob, Certificate } from "@/lib/types";

const JOBS_TABLE = "generation_jobs";
const CERTS_TABLE = "certificates";

export async function createJob(
  templateId: string,
  totalCount: number
): Promise<GenerationJob> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(JOBS_TABLE)
    .insert({
      template_id: templateId,
      status: "pending",
      total_count: totalCount,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create job: ${error.message}`);
  return data as GenerationJob;
}

export async function getJobById(id: string): Promise<GenerationJob> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(JOBS_TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) throw new JobNotFoundError(id);
  return data as GenerationJob;
}

export async function getJobWithCertificates(
  id: string
): Promise<{ job: GenerationJob; certificates: Certificate[] }> {
  const job = await getJobById(id);

  const supabase = createAdminClient();
  const { data: certificates } = await supabase
    .from(CERTS_TABLE)
    .select("*")
    .eq("job_id", id)
    .order("created_at", { ascending: true });

  return { job, certificates: (certificates ?? []) as Certificate[] };
}

export async function updateJobStatus(
  id: string,
  status: string,
  extra: Record<string, unknown> = {}
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from(JOBS_TABLE)
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq("id", id);

  if (error) throw new Error(`Failed to update job: ${error.message}`);
}

export async function incrementJobProgress(
  id: string,
  field: "processed_count" | "error_count"
): Promise<void> {
  const supabase = createAdminClient();

  const { data: job } = await supabase
    .from(JOBS_TABLE)
    .select("processed_count, error_count")
    .eq("id", id)
    .single();

  if (!job) return;

  const current = (job as Record<string, number>)[field] ?? 0;

  await supabase
    .from(JOBS_TABLE)
    .update({
      [field]: current + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function appendJobError(
  id: string,
  rowError: { row: number; message: string }
): Promise<void> {
  const supabase = createAdminClient();

  const { data: job } = await supabase
    .from(JOBS_TABLE)
    .select("errors")
    .eq("id", id)
    .single();

  if (!job) return;

  const errors = Array.isArray(job.errors) ? job.errors : [];
  errors.push(rowError);

  await supabase
    .from(JOBS_TABLE)
    .update({ errors, updated_at: new Date().toISOString() })
    .eq("id", id);
}
