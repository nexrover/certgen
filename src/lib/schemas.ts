import { z } from "zod";

const BackgroundUrlSchema = z
  .string()
  .refine(
    (value) => {
      if (value.startsWith("data:image/")) return true;
      return z.string().url().safeParse(value).success;
    },
    { message: "backgroundUrl must be a valid URL or image data URL" }
  );

export const TemplateFieldSchema = z.object({
  type: z.enum(["text", "image"]),
  value: z.string(),
  x: z.number(),
  y: z.number(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  fontWeight: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  backgroundUrl: BackgroundUrlSchema.optional().nullable(),
  fields: z.array(TemplateFieldSchema).min(1),
});

export const SaveBuilderTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  paperSize: z.enum([
    "A4",
    "A4_LANDSCAPE",
    "US_LETTER",
    "US_LETTER_LANDSCAPE",
    "YOUTUBE_THUMBNAIL",
    "SOCIAL_1080",
    "SQUARE_500",
    "SQUARE_1024",
    "SQUARE_1200",
    "OG_IMAGE",
    "SOCIAL_STORY",
    "CUSTOM_16_9",
    "RESUME",
    "INVOICE"
  ]),
  canvasJson: z.record(z.string(), z.unknown()),
  backgroundUrl: BackgroundUrlSchema.optional().nullable(),
  category: z.string().min(1).max(50).optional(),
});

export const BulkGenerateSchema = z.object({
  templateId: z.string().uuid(),
});

export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>;
export type SaveBuilderTemplateInput = z.infer<typeof SaveBuilderTemplateSchema>;
export type BulkGenerateInput = z.infer<typeof BulkGenerateSchema>;
