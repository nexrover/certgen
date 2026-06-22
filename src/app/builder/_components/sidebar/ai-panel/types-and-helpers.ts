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
  // ── 1. Tech Startup ────────────────────────────────────────
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

  // ── 2. Elegant Studio ──────────────────────────────────────
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

  // ── 3. Neon Cyberpunk ──────────────────────────────────────
  {
    id: "default-3",
    user_id: "default",
    name: "Neon Cyberpunk",
    colors: ["#F43F5E", "#7C3AED", "#06B6D4", "#0F172A"],
    typography: { title: "Orbitron", subtitle: "Rajdhani", body: "Rajdhani" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    layout: {
      id: "layout-diagonal-impact",
      name: "Diagonal Impact",
      description: "Angled dividers splitting the canvas for a dynamic, energetic feel.",
      headingPosition: "top-left",
      subtitlePosition: "center-left",
      logoPosition: "bottom-right",
      imagePosition: "right-half-diagonal",
      iconPosition: "top-right",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ── 4. Organic Earth ───────────────────────────────────────
  {
    id: "default-4",
    user_id: "default",
    name: "Organic Earth",
    colors: ["#22C55E", "#15803D", "#166534", "#052E16"],
    typography: { title: "Lora", subtitle: "Source Sans 3", body: "Source Sans 3" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    layout: {
      id: "layout-bottom-heavy",
      name: "Bottom Heavy",
      description: "Most content anchored to the bottom third. Clean upper space for visuals or breathing room.",
      headingPosition: "bottom-center",
      subtitlePosition: "bottom-center-above-heading",
      logoPosition: "top-center",
      imagePosition: "top-half",
      iconPosition: "bottom-left",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ── 5. Royal Luxury ────────────────────────────────────────
  {
    id: "default-5",
    user_id: "default",
    name: "Royal Luxury",
    colors: ["#CA8A04", "#A16207", "#713F12", "#1C1917"],
    typography: { title: "Cormorant Garamond", subtitle: "Cormorant Garamond", body: "Cormorant Garamond" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    layout: {
      id: "layout-framed-border",
      name: "Framed Border",
      description: "Decorative border frame surrounding centered content. Elegant and formal.",
      headingPosition: "center-upper",
      subtitlePosition: "center",
      logoPosition: "center-top-inside-frame",
      imagePosition: "center-below-subtitle",
      iconPosition: "center-bottom-inside-frame",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ── 6. Fresh Mint ──────────────────────────────────────────
  {
    id: "default-6",
    user_id: "default",
    name: "Fresh Mint",
    colors: ["#14B8A6", "#0D9488", "#0F766E", "#134E4A"],
    typography: { title: "Poppins", subtitle: "Poppins", body: "Inter" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    layout: {
      id: "layout-vertical-stack",
      name: "Vertical Stack",
      description: "Elements stacked vertically top-to-bottom with even spacing. Simple & clean.",
      headingPosition: "top-center",
      subtitlePosition: "upper-center",
      logoPosition: "top-center-above-heading",
      imagePosition: "middle-center",
      iconPosition: "bottom-center",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ── 7. Sunset Gradient ─────────────────────────────────────
  {
    id: "default-7",
    user_id: "default",
    name: "Sunset Gradient",
    colors: ["#F97316", "#E11D48", "#9333EA", "#1E1B4B"],
    typography: { title: "Sora", subtitle: "Sora", body: "Inter" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    layout: {
      id: "layout-hero-banner",
      name: "Hero Banner",
      description: "Large full-width heading at the top with a bold hero area. Great for thumbnails & social posts.",
      headingPosition: "top-center-large",
      subtitlePosition: "top-center-below-heading",
      logoPosition: "top-left",
      imagePosition: "center-full-width",
      iconPosition: "bottom-right",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ── 8. Ocean Deep ──────────────────────────────────────────
  {
    id: "default-8",
    user_id: "default",
    name: "Ocean Deep",
    colors: ["#0EA5E9", "#0369A1", "#075985", "#0C4A6E"],
    typography: { title: "Merriweather", subtitle: "Open Sans", body: "Open Sans" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    layout: {
      id: "layout-overlay-card",
      name: "Overlay Card",
      description: "A floating card/panel overlaid on a full-bleed background image or color.",
      headingPosition: "card-top-center",
      subtitlePosition: "card-center",
      logoPosition: "card-top-left",
      imagePosition: "full-background",
      iconPosition: "card-bottom-center",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ── 9. Cherry Blossom ──────────────────────────────────────
  {
    id: "default-9",
    user_id: "default",
    name: "Cherry Blossom",
    colors: ["#EC4899", "#BE185D", "#9D174D", "#831843"],
    typography: { title: "Dancing Script", subtitle: "Quicksand", body: "Quicksand" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    layout: {
      id: "layout-z-pattern",
      name: "Z-Pattern",
      description: "Eye follows a Z shape: top-left → top-right → bottom-left → bottom-right.",
      headingPosition: "top-left",
      subtitlePosition: "top-right",
      logoPosition: "top-left",
      imagePosition: "center",
      iconPosition: "bottom-right",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ── 10. Monochrome Pro ─────────────────────────────────────
  {
    id: "default-10",
    user_id: "default",
    name: "Monochrome Pro",
    colors: ["#18181B", "#27272A", "#71717A", "#D4D4D8"],
    typography: { title: "Space Grotesk", subtitle: "DM Sans", body: "DM Sans" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    layout: {
      id: "layout-magazine-spread",
      name: "Magazine Spread",
      description: "Editorial-style layout with mixed column widths, pull-quotes, and layered elements.",
      headingPosition: "top-left-large",
      subtitlePosition: "top-left-below-heading",
      logoPosition: "bottom-right",
      imagePosition: "right-column-full-height",
      iconPosition: "top-right",
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
