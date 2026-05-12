export type FieldType = "text" | "image";

export interface TemplateField {
  type: FieldType;
  value: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  width?: number;
  height?: number;
}

export type PaperSize = "A4" | "A4_LANDSCAPE" | "US_LETTER" | "US_LETTER_LANDSCAPE";

export const PAPER_DIMENSIONS: Record<PaperSize, { width: number; height: number }> = {
  A4: { width: 595, height: 842 },
  A4_LANDSCAPE: { width: 842, height: 595 },
  US_LETTER: { width: 612, height: 792 },
  US_LETTER_LANDSCAPE: { width: 792, height: 612 },
};

export interface CertificateTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  background_url: string | null;
  fields: TemplateField[];
  canvas_json: Record<string, unknown> | null;
  paper_size: PaperSize;
  category: string;
  created_at: string;
  updated_at: string;
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface GenerationJob {
  id: string;
  template_id: string;
  status: JobStatus;
  total_count: number;
  processed_count: number;
  error_count: number;
  errors: JobError[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface JobError {
  row: number;
  message: string;
}

export interface Certificate {
  id: string;
  job_id: string;
  template_id: string;
  row_data: Record<string, string>;
  file_url: string | null;
  storage_path: string | null;
  created_at: string;
}

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: { row: number; field: string; message: string }[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
