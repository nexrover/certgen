import type { BrandKit, BrandKitLayout, PaperSize } from "@/lib/types";

export type ModalId = "layout" | "elements" | "images" | "brand-kit" | "prompt-generator" | null;

export interface PromptGeneratorSelections {
  brandKit: BrandKit | null;
  layout: BrandKitLayout | null;
  elements: SelectedElement[];
  images: SelectedImage[];
  canvasSize: PaperSize | null;
  templateSkillSet: string | null;
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

export type AIProvider = "gemini" | "groq";

export interface AIModelOption {
  value: string;
  label: string;
  description: string;
  provider: AIProvider;
}

export const AI_MODELS: AIModelOption[] = [
  { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash", description: "Next-gen speed & quality", provider: "gemini" },
  { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", description: "Advanced experimental features", provider: "gemini" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Latest stable release", provider: "gemini" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", description: "Balanced performance", provider: "gemini" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", description: "Fast & efficient", provider: "gemini" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", description: "Advanced reasoning", provider: "gemini" },
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", description: "Most capable", provider: "groq" },
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B", description: "Blazing fast", provider: "groq" },
  { value: "llama3-70b-8192", label: "Llama 3 70B", description: "Great quality", provider: "groq" },
  { value: "llama3-8b-8192", label: "Llama 3 8B", description: "Fast & light", provider: "groq" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B", description: "Mixture of experts", provider: "groq" },
  { value: "gemma2-9b-it", label: "Gemma 2 9B", description: "Compact & efficient", provider: "groq" },
] as const;
