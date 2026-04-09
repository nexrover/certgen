# CertGen - Certificate Generator SaaS

Bulk certificate generation SaaS built with Next.js 16 App Router and Supabase.

## Tech Stack

- **Frontend + API**: Next.js 16 (App Router, Route Handlers)
- **Database**: Supabase Postgres
- **Storage**: Supabase Storage
- **PDF Generation**: Puppeteer (puppeteer-core + @sparticuz/chromium)
- **CSV Parsing**: PapaParse
- **Validation**: Zod
- **Styling**: Tailwind CSS v4

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in your Supabase credentials

# Run development server
pnpm dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

## Project Structure

```
src/
├── app/
│   ├── api/                    # Route Handlers
│   │   ├── templates/          # POST create, GET list, GET by id
│   │   ├── certificates/bulk/  # POST bulk generate
│   │   └── jobs/[id]/          # GET job status
│   ├── templates/              # Template management UI
│   ├── generate/               # Bulk generation UI
│   └── jobs/[id]/              # Job status polling UI
├── components/ui/              # Shared UI components
├── lib/
│   ├── supabase/               # Supabase client setup
│   ├── engine/                 # Core processing modules
│   │   ├── variable-replacer   # {{var}} extraction + substitution
│   │   ├── csv-parser          # CSV -> validated JSON
│   │   ├── html-renderer       # Template -> HTML string
│   │   └── pdf-generator       # HTML -> PDF via Puppeteer
│   ├── services/               # Business logic layer
│   ├── schemas.ts              # Zod validation schemas
│   ├── types.ts                # TypeScript interfaces
│   └── errors.ts               # Structured error classes
└── data/                       # Sample data
```

## API Endpoints

### Templates

**POST /api/templates** - Create a template

```json
{
  "name": "Course Completion",
  "width": 1920,
  "height": 1080,
  "backgroundUrl": null,
  "fields": [
    { "type": "text", "value": "{{name}}", "x": 960, "y": 400, "fontSize": 36, "color": "#16213e" }
  ]
}
```

Response: `{ "success": true, "data": { "id": "uuid", ... } }`

**GET /api/templates** - List all templates

**GET /api/templates/:id** - Get template by ID

### Bulk Generation

**POST /api/certificates/bulk** - Start bulk generation (multipart form)

Form fields:
- `templateId`: UUID of the template
- `file`: CSV file with data matching template variables

Response:
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "totalRows": 5,
    "validRows": 5,
    "invalidRows": 0,
    "csvErrors": []
  }
}
```

### Job Status

**GET /api/jobs/:id** - Poll job progress

Response:
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "uuid",
      "status": "completed",
      "total_count": 5,
      "processed_count": 5,
      "error_count": 0
    },
    "certificates": [
      {
        "id": "uuid",
        "file_url": "https://...supabase.co/storage/v1/object/public/certificates/...",
        "row_data": { "name": "Alice Johnson", "course": "Advanced React Patterns", "date": "2026-04-01" }
      }
    ]
  }
}
```

## Full Request Flow

```
1. POST /api/templates          -> Create template (returns template ID)
2. POST /api/certificates/bulk  -> Upload CSV + template ID (returns job ID)
3. GET  /api/jobs/:id           -> Poll until status = "completed"
4. Download PDFs from certificate file_url fields
```

## Database Schema

- **certificate_templates** - Stores template JSON (name, dimensions, fields)
- **generation_jobs** - Tracks job status and progress
- **certificates** - One row per generated certificate with PDF URL

## Rendering Pipeline

```
Template JSON -> Variable Substitution -> HTML Rendering -> Puppeteer PDF -> Supabase Storage
```

## Sample Data

- Template: `src/data/sample-template.json`
- CSV: `src/data/sample-data.csv`
