# Certificate SaaS — Detailed Patterns

## Template Variable Extraction

```typescript
function extractVariables(template: CertificateTemplate): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();
  for (const field of template.fields) {
    let match;
    while ((match = regex.exec(field.value)) !== null) {
      variables.add(match[1]);
    }
  }
  return Array.from(variables);
}
```

## CSV Parsing Pipeline

```typescript
import { parse } from "papaparse";

interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  errors: { row: number; message: string }[];
}

function parseAndValidate(file: File, requiredHeaders: string[]): ParsedCSV {
  const { data, errors } = parse(file, { header: true, skipEmptyLines: true });

  const headers = Object.keys(data[0] ?? {});
  const missing = requiredHeaders.filter(h => !headers.includes(h));
  if (missing.length > 0) {
    throw new ValidationError(`Missing required columns: ${missing.join(", ")}`);
  }

  const validRows: Record<string, string>[] = [];
  const rowErrors: { row: number; message: string }[] = [];

  data.forEach((row, i) => {
    const emptyFields = requiredHeaders.filter(h => !row[h]?.trim());
    if (emptyFields.length > 0) {
      rowErrors.push({ row: i + 1, message: `Empty fields: ${emptyFields.join(", ")}` });
    } else {
      validRows.push(row);
    }
  });

  return { headers, rows: validRows, errors: rowErrors };
}
```

## Job State Machine

```
┌─────────┐    ┌────────────┐    ┌───────────┐
│ pending  │───▶│ processing │───▶│ completed │
└─────────┘    └────────────┘    └───────────┘
                     │
                     ▼
                ┌──────────┐
                │  failed   │
                └──────────┘
```

```typescript
type JobStatus = "pending" | "processing" | "completed" | "failed";

interface GenerationJob {
  id: string;
  templateId: string;
  status: JobStatus;
  totalCount: number;
  processedCount: number;
  errorCount: number;
  createdAt: string;
  completedAt: string | null;
}
```

## Supabase Storage Pattern

```typescript
async function uploadCertificate(
  supabase: SupabaseClient,
  jobId: string,
  index: number,
  pdfBuffer: Buffer
): Promise<string> {
  const path = `certificates/${jobId}/${index}.pdf`;
  const { error } = await supabase.storage
    .from("certificates")
    .upload(path, pdfBuffer, { contentType: "application/pdf" });

  if (error) throw new StorageError(`Upload failed: ${error.message}`);
  return path;
}
```

## Zod Schemas

```typescript
import { z } from "zod";

const CreateJobSchema = z.object({
  templateId: z.string().uuid(),
  csvData: z.array(z.record(z.string())).min(1, "At least one row required"),
});

const TemplateFieldSchema = z.object({
  type: z.enum(["text", "image"]),
  value: z.string(),
  x: z.number(),
  y: z.number(),
  fontSize: z.number().optional(),
});

const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  fields: z.array(TemplateFieldSchema).min(1),
  backgroundUrl: z.string().url().optional(),
});
```
