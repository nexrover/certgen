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

export type PaperSize =
  | "A4"
  | "A4_LANDSCAPE"
  | "US_LETTER"
  | "US_LETTER_LANDSCAPE"
  | "YOUTUBE_THUMBNAIL"
  | "SOCIAL_1080"
  | "SQUARE_500"
  | "OG_IMAGE"
  | "CUSTOM_16_9";

export const PAPER_DIMENSIONS: Record<PaperSize, { width: number; height: number }> = {
  A4: { width: 595, height: 842 },
  A4_LANDSCAPE: { width: 842, height: 595 },
  US_LETTER: { width: 612, height: 792 },
  US_LETTER_LANDSCAPE: { width: 792, height: 612 },
  YOUTUBE_THUMBNAIL: { width: 1280, height: 720 },
  SOCIAL_1080: { width: 1080, height: 1080 },
  SQUARE_500: { width: 500, height: 500 },
  OG_IMAGE: { width: 1200, height: 630 },
  CUSTOM_16_9: { width: 1920, height: 1080 },
};

/**
 * Maps a template category slug to its default paper size.
 * Used to auto-select the correct canvas preset when the builder opens.
 */
export const CATEGORY_DEFAULT_PAPER_SIZE: Record<string, PaperSize> = {
  certificate: "A4_LANDSCAPE",
  youtube: "YOUTUBE_THUMBNAIL",
  email: "A4",
  ecommerce: "SQUARE_500",
  "real-estate": "A4_LANDSCAPE",
  "shipping-label": "US_LETTER",
  resume: "A4",
  "open-graph": "OG_IMAGE",
  "christmas-card": "A4",
  "social-media": "SOCIAL_1080",
  receipt: "US_LETTER",
  invoice: "A4",
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
