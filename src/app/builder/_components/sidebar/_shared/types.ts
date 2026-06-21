import type { BrandKit, BrandKitLayout, PaperSize } from "@/lib/types";

export type ModalId = "layout" | "elements" | "images" | "brand-kit" | "prompt-generator" | null;

export interface PromptGeneratorSelections {
  brandKit: BrandKit | null;
  layout: BrandKitLayout | null;
  elements: SelectedElement[];
  images: SelectedImage[];
  canvasSize: PaperSize;
  templateSkillSet: string;
}

export interface SelectedElement {
  url: string;
  label: string;
}

export interface SelectedImage {
  url: string;
  name: string;
  isCustom: boolean;
}

export const TEMPLATE_SKILL_SETS = [
  { value: "certificate", label: "Certificate" },
  { value: "youtube", label: "YouTube Thumbnail" },
  { value: "email", label: "Email Template" },
  { value: "ecommerce", label: "E-Commerce Product" },
  { value: "resume", label: "Resume" },
  { value: "social-media", label: "Social Media Post" },
  { value: "invoice", label: "Invoice" },
  { value: "receipt", label: "Receipt" },
  { value: "christmas-card", label: "Christmas Card" },
  { value: "real-estate", label: "Real Estate" },
] as const;

export const AI_MODELS = [
  { value: "Gemini 1.5 Flash", label: "Gemini 1.5 Flash", description: "Fast & efficient" },
  { value: "Gemini 1.5 Pro", label: "Gemini 1.5 Pro", description: "Advanced reasoning" },
  { value: "Gemini 2.0 Flash", label: "Gemini 2.0 Flash", description: "Latest generation" },
  { value: "Auto", label: "Auto", description: "Choose the best model" },
] as const;
