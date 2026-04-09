import pLimit from "p-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { substituteVariables, substituteCanvasVariables } from "@/lib/engine/variable-replacer";
import { renderCertificateHTML } from "@/lib/engine/html-renderer";
import { htmlToPdf, getBrowser, closeBrowser } from "@/lib/engine/pdf-generator";
import { canvasJsonToPdf, closeBrowser as closeCanvasBrowser } from "@/lib/engine/canvas-renderer";
import {
  updateJobStatus,
  incrementJobProgress,
  appendJobError,
} from "@/lib/services/job-service";
import type { CertificateTemplate } from "@/lib/types";

const CONCURRENCY = 5;

async function generateAndTrack(
  jobId: string,
  template: CertificateTemplate,
  rowData: Record<string, string>,
  index: number
): Promise<void> {
  try {
    let pdfBuffer: Buffer;

    if (template.canvas_json) {
      const substituted = substituteCanvasVariables(template.canvas_json, rowData);
      pdfBuffer = await canvasJsonToPdf(substituted, template.width, template.height);
    } else {
      const processed = substituteVariables(template, rowData);
      const html = renderCertificateHTML(processed);
      pdfBuffer = await htmlToPdf(html, template.width, template.height);
    }

    const storagePath = `certificates/${jobId}/${index}.pdf`;
    const supabase = createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("certificates").getPublicUrl(storagePath);

    await supabase.from("certificates").insert({
      job_id: jobId,
      template_id: template.id,
      row_data: rowData,
      file_url: publicUrl,
      storage_path: storagePath,
    });

    await incrementJobProgress(jobId, "processed_count");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await appendJobError(jobId, { row: index + 1, message });
    await incrementJobProgress(jobId, "error_count");
  }
}

export async function processJobAsync(
  jobId: string,
  template: CertificateTemplate,
  rows: Record<string, string>[]
): Promise<void> {
  try {
    await updateJobStatus(jobId, "processing");

    if (!template.canvas_json) {
      await getBrowser();
    }

    const limit = pLimit(CONCURRENCY);
    await Promise.all(
      rows.map((row, i) =>
        limit(() => generateAndTrack(jobId, template, row, i))
      )
    );

    await updateJobStatus(jobId, "completed", {
      completed_at: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await updateJobStatus(jobId, "failed", {
      errors: [{ row: 0, message: `Job failed: ${message}` }],
    });
  } finally {
    await closeBrowser();
    await closeCanvasBrowser();
  }
}
