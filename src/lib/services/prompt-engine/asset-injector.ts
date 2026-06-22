import type { InjectedAsset } from "./types";

/* ──────────────────────────────────────────────────────────
 * Asset Injector
 *
 * Formats user-selected assets (logos, elements, images) into
 * structured LLM instruction blocks. The LLM creates named
 * placeholder Rects using a `__ASSET_*` naming convention.
 * A post-processor in the route handler later replaces these
 * with actual Fabric.js Image objects using the real URLs.
 * ────────────────────────────────────────────────────────── */

/** Naming convention prefix for asset placeholders. */
export const ASSET_PLACEHOLDER_PREFIX = "__ASSET_";

/** Builds a unique placeholder name for an asset. */
export function assetPlaceholderName(kind: string, index: number): string {
  return `${ASSET_PLACEHOLDER_PREFIX}${kind.toUpperCase()}_${index}__`;
}

/** Builds the asset injection block for the LLM prompt. */
export function buildAssetBlock(assets: InjectedAsset[]): { header: string; content: string; weight: number } | null {
  if (assets.length === 0) return null;

  const logos = assets.filter((a) => a.kind === "logo");
  const elements = assets.filter((a) => a.kind === "element");
  const images = assets.filter((a) => a.kind === "image");

  const lines: string[] = [];

  if (logos.length > 0) {
    lines.push(`LOGO ASSETS (${logos.length}):
${logos.map((l, i) => `  ${i + 1}. "${l.label}" — Placeholder Name: ${assetPlaceholderName("logo", i)}`).join("\n")}
INSTRUCTION: For each logo, create a Rect with the EXACT placeholder name listed above.
Place it at a visually appropriate position (e.g., top-left corner, centered header).
Use sizes proportional to the canvas (e.g., 120-200px wide for corner logos).
Set fill to "#e2e8f0" with stroke "#bae6fd" and strokeWidth 1.5 as a visual indicator.`);
  }

  if (elements.length > 0) {
    lines.push(`\nELEMENT ASSETS (${elements.length}):
${elements.map((e, i) => `  ${i + 1}. "${e.label}" — Placeholder Name: ${assetPlaceholderName("element", i)}`).join("\n")}
INSTRUCTION: For each element, create a Rect or Circle with the EXACT placeholder name listed above.
Position them according to the design's visual balance.
Use opacity 0.1-0.3 for background decorative elements, or full opacity for prominent badge/icon areas.
Set fill to "#fef3c7" with stroke "#f59e0b" and strokeWidth 1.5 as a visual indicator.`);
  }

  if (images.length > 0) {
    lines.push(`\nIMAGE ASSETS (${images.length}):
${images.map((im, i) => `  ${i + 1}. "${im.label}" — Placeholder Name: ${assetPlaceholderName("image", i)}`).join("\n")}
INSTRUCTION: For each image, create a Rect with the EXACT placeholder name listed above.
For hero/banner images: use 60-80% of canvas width. For thumbnails: use 150-300px.
Position them to complement the text hierarchy and layout flow.
Set fill to "#dbeafe" with stroke "#3b82f6" and strokeWidth 1.5 as a visual indicator.`);
  }

  return {
    header: "INJECTED_ASSETS",
    content: `═══════════════════════════════════════════════════════
 INJECTED ASSETS — USER-PROVIDED
═══════════════════════════════════════════════════════

The user has selected the following assets to be incorporated
into the design. You MUST create placeholder elements for each.

CRITICAL: Each placeholder MUST have its "name" property set to
the EXACT placeholder name listed below. The system will scan
for these names and replace them with actual image objects.

${lines.join("\n\n")}

NAMING RULE — Every asset placeholder object MUST include:
  "name": "<exact placeholder name from above>"

Example Rect with placeholder name:
  { "type": "Rect", "name": "${assetPlaceholderName("logo", 0)}", "left": 30, "top": 20, "width": 150, "height": 50, "fill": "#e2e8f0", "stroke": "#bae6fd", "strokeWidth": 1.5, "rx": 4, "ry": 4 }

Do NOT skip any listed asset. Do NOT invent new asset names.
Every asset above MUST appear as a named placeholder in your output.`,
    weight: 80,
  };
}
