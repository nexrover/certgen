import type { BrandKitLayout } from "@/lib/types";

/**
 * 15 default layout presets that guide the AI on element placement.
 *
 * Each position string is a human-readable instruction the prompt
 * orchestrator injects into the system prompt so the AI knows
 * exactly where to place every element type on the canvas.
 */
export const DEFAULT_LAYOUTS: BrandKitLayout[] = [
  // ── 1. Centered Classic ────────────────────────────────
  {
    id: "layout-centered-classic",
    name: "Centered Classic",
    description: "Everything centered vertically. Formal & symmetrical — ideal for certificates and awards.",
    headingPosition: "top-center",
    subtitlePosition: "center",
    logoPosition: "top-center",
    imagePosition: "center",
    iconPosition: "bottom-center",
  },

  // ── 2. Left Sidebar Split ──────────────────────────────
  {
    id: "layout-left-sidebar",
    name: "Left Sidebar Split",
    description: "Sidebar on the left for branding & contact. Main content on the right.",
    headingPosition: "right-top",
    subtitlePosition: "right-center",
    logoPosition: "left-top",
    imagePosition: "left-center",
    iconPosition: "left-bottom",
  },

  // ── 3. Right Sidebar Split ─────────────────────────────
  {
    id: "layout-right-sidebar",
    name: "Right Sidebar Split",
    description: "Main content on the left, sidebar on the right for supplementary info.",
    headingPosition: "left-top",
    subtitlePosition: "left-center",
    logoPosition: "right-top",
    imagePosition: "right-center",
    iconPosition: "right-bottom",
  },

  // ── 4. Hero Banner ─────────────────────────────────────
  {
    id: "layout-hero-banner",
    name: "Hero Banner",
    description: "Large full-width heading at the top with a bold hero area. Great for thumbnails & social posts.",
    headingPosition: "top-center-large",
    subtitlePosition: "top-center-below-heading",
    logoPosition: "top-left",
    imagePosition: "center-full-width",
    iconPosition: "bottom-right",
  },

  // ── 5. Diagonal Impact ─────────────────────────────────
  {
    id: "layout-diagonal-impact",
    name: "Diagonal Impact",
    description: "Angled dividers splitting the canvas for a dynamic, energetic feel.",
    headingPosition: "top-left",
    subtitlePosition: "center-left",
    logoPosition: "bottom-right",
    imagePosition: "right-half-diagonal",
    iconPosition: "top-right",
  },

  // ── 6. Grid Mosaic ─────────────────────────────────────
  {
    id: "layout-grid-mosaic",
    name: "Grid Mosaic",
    description: "Content arranged in a 2×2 or 3-column grid. Clean, structured, and modern.",
    headingPosition: "top-center-spanning",
    subtitlePosition: "top-center-below-heading",
    logoPosition: "top-left",
    imagePosition: "grid-cells",
    iconPosition: "bottom-center",
  },

  // ── 7. Bottom Heavy ────────────────────────────────────
  {
    id: "layout-bottom-heavy",
    name: "Bottom Heavy",
    description: "Most content anchored to the bottom third. Clean upper space for visuals or breathing room.",
    headingPosition: "bottom-center",
    subtitlePosition: "bottom-center-above-heading",
    logoPosition: "top-center",
    imagePosition: "top-half",
    iconPosition: "bottom-left",
  },

  // ── 8. Top Strip ───────────────────────────────────────
  {
    id: "layout-top-strip",
    name: "Top Strip",
    description: "Colored banner strip at the top with branding. Content flows below.",
    headingPosition: "top-banner-center",
    subtitlePosition: "below-banner-center",
    logoPosition: "top-banner-left",
    imagePosition: "center",
    iconPosition: "top-banner-right",
  },

  // ── 9. Z-Pattern ───────────────────────────────────────
  {
    id: "layout-z-pattern",
    name: "Z-Pattern",
    description: "Eye follows a Z shape: top-left → top-right → bottom-left → bottom-right.",
    headingPosition: "top-left",
    subtitlePosition: "top-right",
    logoPosition: "top-left",
    imagePosition: "center",
    iconPosition: "bottom-right",
  },

  // ── 10. F-Pattern ──────────────────────────────────────
  {
    id: "layout-f-pattern",
    name: "F-Pattern",
    description: "Eye scans left-to-right at the top, then down the left side. Great for text-heavy designs.",
    headingPosition: "top-left",
    subtitlePosition: "top-left-below-heading",
    logoPosition: "top-right",
    imagePosition: "right-center",
    iconPosition: "bottom-left",
  },

  // ── 11. Overlay Card ───────────────────────────────────
  {
    id: "layout-overlay-card",
    name: "Overlay Card",
    description: "A floating card/panel overlaid on a full-bleed background image or color.",
    headingPosition: "card-top-center",
    subtitlePosition: "card-center",
    logoPosition: "card-top-left",
    imagePosition: "full-background",
    iconPosition: "card-bottom-center",
  },

  // ── 12. Vertical Stack ─────────────────────────────────
  {
    id: "layout-vertical-stack",
    name: "Vertical Stack",
    description: "Elements stacked vertically top-to-bottom with even spacing. Simple & clean.",
    headingPosition: "top-center",
    subtitlePosition: "upper-center",
    logoPosition: "top-center-above-heading",
    imagePosition: "middle-center",
    iconPosition: "bottom-center",
  },

  // ── 13. Asymmetric Focus ───────────────────────────────
  {
    id: "layout-asymmetric-focus",
    name: "Asymmetric Focus",
    description: "Large focal element on one side with smaller supporting elements offset.",
    headingPosition: "left-center",
    subtitlePosition: "left-below-heading",
    logoPosition: "right-top",
    imagePosition: "right-large",
    iconPosition: "left-bottom",
  },

  // ── 14. Framed Border ──────────────────────────────────
  {
    id: "layout-framed-border",
    name: "Framed Border",
    description: "Decorative border frame surrounding centered content. Elegant and formal.",
    headingPosition: "center-upper",
    subtitlePosition: "center",
    logoPosition: "center-top-inside-frame",
    imagePosition: "center-below-subtitle",
    iconPosition: "center-bottom-inside-frame",
  },

  // ── 15. Magazine Spread ────────────────────────────────
  {
    id: "layout-magazine-spread",
    name: "Magazine Spread",
    description: "Editorial-style layout with mixed column widths, pull-quotes, and layered elements.",
    headingPosition: "top-left-large",
    subtitlePosition: "top-left-below-heading",
    logoPosition: "bottom-right",
    imagePosition: "right-column-full-height",
    iconPosition: "top-right",
  },
];

/**
 * Position options for the custom-layout dropdowns.
 * Grouped by axis so the UI can render them in a sensible order.
 */
export const POSITION_OPTIONS = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "center-left", label: "Center Left" },
  { value: "center", label: "Center" },
  { value: "center-right", label: "Center Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
  { value: "left-top", label: "Left Panel – Top" },
  { value: "left-center", label: "Left Panel – Center" },
  { value: "left-bottom", label: "Left Panel – Bottom" },
  { value: "right-top", label: "Right Panel – Top" },
  { value: "right-center", label: "Right Panel – Center" },
  { value: "right-bottom", label: "Right Panel – Bottom" },
  { value: "full-background", label: "Full Background" },
  { value: "top-banner-center", label: "Top Banner – Center" },
  { value: "top-banner-left", label: "Top Banner – Left" },
  { value: "top-banner-right", label: "Top Banner – Right" },
] as const;
