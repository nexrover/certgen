import type { BrandKit } from "@/lib/types";
import {
  compilePrompt,
  type PromptCompilationInput,
  type InjectedAsset,
} from "@/lib/services/prompt-engine";

/* ──────────────────────────────────────────────────────────
 * Prompt Orchestrator (v2 — Delegates to Prompt Engine)
 *
 * This module is the backward-compatible entrypoint that the
 * existing route handlers and UI components import. It maps
 * the old function signatures to the new PromptCompiler
 * architecture.
 *
 * The actual prompt compilation is handled by the polymorphic
 * Prompt Engine under src/lib/services/prompt-engine/.
 * ────────────────────────────────────────────────────────── */

/* ── Backward-compatible API ────────────────────────────── */

/**
 * Build a system prompt for brand-kit-constrained generation.
 * Delegates to the Prompt Compiler with full structural input.
 */
export function buildBrandKitSystemPrompt(
  brandKit: BrandKit,
  width: number,
  height: number,
  paperSize: string,
  category: string,
  style: string
): string {
  const input: PromptCompilationInput = {
    skillSet: category,
    width,
    height,
    paperSize,
    style,
    brandKit,
    layout: brandKit.layout ?? null,
    assets: extractAssetsFromBrandKit(brandKit),
    userPrompt: "",
  };

  const compiled = compilePrompt(input);
  return compiled.systemInstruction;
}

/**
 * Build a system prompt for default (no brand kit) generation.
 * Delegates to the Prompt Compiler with structural input.
 */
export function buildDefaultSystemPrompt(
  width: number,
  height: number,
  paperSize: string,
  category: string,
  style: string
): string {
  const input: PromptCompilationInput = {
    skillSet: category,
    width,
    height,
    paperSize,
    style,
    brandKit: null,
    layout: null,
    assets: [],
    userPrompt: "",
  };

  const compiled = compilePrompt(input);
  return compiled.systemInstruction;
}

/**
 * Generate a ready-to-use descriptive prompt that auto-populates
 * the AI Design textarea when the user selects a brand kit.
 */
export function generateBrandKitSuggestionPrompt(
  brandKit: BrandKit,
  category: string
): string {
  const { name: brandName, colors, typography } = brandKit;

  const colorDesc =
    colors.length > 0
      ? colors.length <= 3
        ? colors.join(", ")
        : `${colors.slice(0, 3).join(", ")} and ${colors.length - 3} more`
      : "brand colours";

  const fontParts: string[] = [];
  if (typography?.title) fontParts.push(`"${typography.title}" for titles`);
  if (typography?.body) fontParts.push(`"${typography.body}" for body text`);
  const fontDesc = fontParts.length > 0 ? fontParts.join(" and ") : "brand typography";

  const categoryFlavour: Record<string, string> = {
    certificate: "a polished, professional certificate",
    youtube: "a vibrant, eye-catching YouTube thumbnail",
    invoice: "a clean, structured invoice",
    resume: "a modern, elegant resume layout",
    receipt: "a compact, well-organized receipt",
    email: "a sleek email template",
    ecommerce: "a product showcase card",
    "social-media": "a bold social media graphic",
    "christmas-card": "a festive holiday card",
    "real-estate": "a premium real-estate listing graphic",
    "shipping-label": "a functional shipping label",
  };
  const templateDesc = categoryFlavour[category] ?? `a stunning ${category} template`;

  return `Design ${templateDesc} using the "${brandName}" brand identity. Use the brand colour palette (${colorDesc}) with ${fontDesc}. Create a premium, cohesive layout that reflects the brand's visual standards with elegant borders, clear hierarchy, and professional spacing.`;
}

/* ── Helper: Extract assets from brand kit ──────────────── */

function extractAssetsFromBrandKit(brandKit: BrandKit): InjectedAsset[] {
  const assets: InjectedAsset[] = [];

  if (brandKit.logos?.length) {
    brandKit.logos.forEach((url, i) => {
      assets.push({ kind: "logo", url, label: `Logo ${i + 1}` });
    });
  }

  if (brandKit.graphics?.length) {
    brandKit.graphics.forEach((url, i) => {
      assets.push({ kind: "element", url, label: `Graphic ${i + 1}` });
    });
  }

  if (brandKit.elements?.length) {
    brandKit.elements.forEach((url, i) => {
      assets.push({ kind: "element", url, label: `Element ${i + 1}` });
    });
  }

  if (brandKit.photos?.length) {
    brandKit.photos.forEach((url, i) => {
      assets.push({ kind: "image", url, label: `Photo ${i + 1}` });
    });
  }

  return assets;
}
