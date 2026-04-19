import { NextResponse } from "next/server";
import { BulkGenerateSchema } from "@/lib/schemas";
import { getTemplateById } from "@/lib/services/template-service";
import { createJob } from "@/lib/services/job-service";
import { processJobAsync } from "@/lib/services/certificate-service";
import { extractVariables } from "@/lib/engine/variable-replacer";
import { parseAndValidate } from "@/lib/engine/csv-parser";
import { AppError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const templateId = formData.get("templateId") as string;
    const csvFile = formData.get("file") as File | null;

    BulkGenerateSchema.parse({ templateId });

    if (!csvFile) {
      return NextResponse.json(
        { success: false, error: "CSV file is required" },
        { status: 400 }
      );
    }

    const template = await getTemplateById(templateId, user.id);
    const templateVars = extractVariables(template);
    const csvText = await csvFile.text();
    const csvResult = parseAndValidate(csvText, templateVars);

    if (csvResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid rows found in CSV" },
        { status: 400 }
      );
    }

    const job = await createJob(templateId, csvResult.rows.length, user.id);

    processJobAsync(job.id, user.id, template, csvResult.rows);

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        totalRows: csvResult.summary.totalRows,
        validRows: csvResult.summary.validRows,
        invalidRows: csvResult.summary.invalidRows,
        csvErrors: csvResult.errors,
      },
    });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.statusCode }
      );
    }
    const message = err instanceof Error ? err.message : "Bulk generation failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
