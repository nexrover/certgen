---
name: certificate-saas
description: >-
  Guides development of a Certificate SaaS built with Next.js App Router and
  Supabase. Covers template system, CSV handling, PDF generation, async job
  processing, and API design. Use when building features for certificate
  generation, template management, bulk processing, or any SaaS-related work
  in this project.
---

# Certificate SaaS Development Guide

## Core Principle

This is a scalable SaaS. Every decision should consider:
- **Async processing** for heavy work
- **Modular design** with clear boundaries
- **Clean architecture** separating UI, logic, and integrations

---

## Template System

Templates are JSON-based. Never hardcode HTML layouts.

```typescript
// Template structure
{
  "name": "Course Completion",
  "fields": [
    { "type": "text", "value": "{{name}}", "x": 100, "y": 200, "fontSize": 24 },
    { "type": "text", "value": "{{course}}", "x": 100, "y": 260, "fontSize": 18 },
    { "type": "text", "value": "{{date}}", "x": 100, "y": 300, "fontSize": 14 }
  ]
}
```

- Variables use `{{variable}}` format
- Always validate that all template variables have matching data before rendering
- For detailed patterns, see [patterns.md](patterns.md)

---

## CSV Handling

1. Parse CSV into structured JSON immediately
2. Validate headers against template variables
3. Reject invalid rows early — don't process partial data

```typescript
// Validation flow
const headers = parseCSVHeaders(file);
const templateVars = extractVariables(template); // ["name", "course", "date"]
const missing = templateVars.filter(v => !headers.includes(v));
if (missing.length > 0) throw new ValidationError(`Missing columns: ${missing.join(", ")}`);
```

---

## PDF Generation

Always follow this pipeline:

```
Template (JSON) → Render HTML → Convert to PDF → Upload to Supabase Storage
```

- Never generate PDF directly from raw data
- Keep layout rendering separate from PDF conversion
- Use consistent dimensions and margins

---

## Supabase Usage

| Feature | Purpose |
|---------|---------|
| Database | Store templates, certificates, jobs, users |
| Storage | Store generated PDF files |
| Auth | User authentication (Supabase Auth only) |
| RLS | Row-level security on all tables |

---

## Job Processing

All bulk operations follow this async pattern:

```
1. API receives request → creates job record (status: "pending")
2. Returns job ID immediately to client
3. Background process picks up job → status: "processing"
4. Processes each certificate
5. Completes → status: "completed" (or "failed" with error)
```

Never process bulk certificates synchronously inside an API handler.

---

## API Design

- Endpoints live in `/app/api/*`
- Keep handlers thin — delegate to `/lib` or `/services`
- Validate all inputs with Zod
- Return consistent responses:

```typescript
// Success
{ success: true, data: { jobId: "abc-123" } }

// Error
{ success: false, error: "Invalid template format" }
```

---

## Error Handling

Never expose raw errors to the client.

```typescript
// In API handlers
try {
  const result = await processRequest(input);
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  logger.error("Request failed", { error });
  return NextResponse.json(
    { success: false, error: "Processing failed" },
    { status: 500 }
  );
}
```

---

## Naming Conventions

| Context | Style | Examples |
|---------|-------|---------|
| Variables / functions | camelCase | `generateCertificate`, `parseCSV` |
| Routes | kebab-case | `/api/generate-certificate` |
| DB tables | snake_case | `certificate_templates`, `generation_jobs` |
| Types / interfaces | PascalCase | `CertificateTemplate`, `JobStatus` |

---

## Edge Cases to Always Consider

- Missing or extra template variables in CSV
- Invalid or malformed CSV files
- Large datasets (1000+ certificates) — must be async
- Failed PDF generation mid-batch — partial completion handling
- Concurrent job submissions from the same user
