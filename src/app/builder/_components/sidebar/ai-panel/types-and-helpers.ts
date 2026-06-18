import type { BrandKit, PaperSize } from "@/lib/types";

export const MAX_FREE_GENERATIONS = 5;
export const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours
export const STORAGE_KEY = "ai_gen_usage";

export type StyleTheme = "classic" | "modern" | "minimal" | "bold";

export interface UsageData {
  count: number;
  windowStart: number | null; // epoch timestamp
}

export const DEFAULT_BRAND_KITS: BrandKit[] = [
  {
    id: "default-1",
    user_id: "default",
    name: "Tech Startup",
    colors: ["#3B82F6", "#1D4ED8", "#1E40AF", "#172554"],
    typography: { title: "Inter", subtitle: "Inter", body: "Inter" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    layout: {
      id: "layout-centered-classic",
      name: "Centered Classic",
      description: "Everything centered vertically. Formal & symmetrical — ideal for certificates and awards.",
      headingPosition: "top-center",
      subtitlePosition: "center",
      logoPosition: "top-center",
      imagePosition: "center",
      iconPosition: "bottom-center",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "default-2",
    user_id: "default",
    name: "Elegant Studio",
    colors: ["#D97706", "#92400E", "#78350F", "#451A03"],
    typography: { title: "Playfair Display", subtitle: "Playfair Display", body: "Playfair Display" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    layout: {
      id: "layout-left-sidebar",
      name: "Left Sidebar Split",
      description: "Sidebar on the left for branding & contact. Main content on the right.",
      headingPosition: "right-top",
      subtitlePosition: "right-center",
      logoPosition: "left-top",
      imagePosition: "left-center",
      iconPosition: "left-bottom",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function detectCategoryFromPaperSize(paperSize: PaperSize, defaultCategory: string): string {
  switch (paperSize) {
    case "A4_LANDSCAPE":
      return "certificate";
    case "YOUTUBE_THUMBNAIL":
      return "youtube";
    case "A4":
      return "email";
    case "SQUARE_500":
      return "ecommerce";
    case "SQUARE_1024":
      return "real-estate";
    case "SQUARE_1200":
      return "social-media";
    case "RESUME":
      return "resume";
    case "CHRISTMAS_CARD":
      return "christmas-card";
    case "RECEIPT":
      return "receipt";
    case "INVOICE":
      return "invoice";
    default:
      return defaultCategory;
  }
}

export function loadUsage(): UsageData {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return { count: 0, windowStart: null };
    const data = JSON.parse(raw) as UsageData;
    if (data.windowStart && Date.now() >= data.windowStart + COOLDOWN_MS) {
      const reset: UsageData = { count: 0, windowStart: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      return reset;
    }
    return data;
  } catch {
    return { count: 0, windowStart: null };
  }
}

export function saveUsage(data: UsageData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
