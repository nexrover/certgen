import type { BrandKitLayout } from "@/lib/types";

/* ──────────────────────────────────────────────────────────
 * Layout Strategy Engine
 *
 * Translates layout blueprints (from BrandKitLayout) into
 * deterministic position mapping rules for the LLM.
 * When no layout is active, provides flexible spatial guidance.
 * ────────────────────────────────────────────────────────── */

/** Builds the layout strategy block for the LLM prompt. */
export function buildLayoutBlock(
  layout: BrandKitLayout | null,
  width: number,
  height: number
): { header: string; content: string; weight: number } | null {
  if (!layout || !layout.id || !layout.name) {
    return null;
  }

  const posMap = buildPositionMapping(width, height);

  return {
    header: "LAYOUT_WIREFRAME_STRATEGY",
    content: `═══════════════════════════════════════════════════════
 LAYOUT POSITIONING CONSTRAINT (ACTIVE)
 Layout: "${layout.name}"
${layout.description ? ` Description: ${layout.description}` : ""}
═══════════════════════════════════════════════════════

You MUST follow these element placement rules precisely.
Canvas dimensions: ${width}×${height}px.

ELEMENT POSITIONS:
  • Heading / Title Textbox      → Place at: ${layout.headingPosition}
  • Subtitle Textbox             → Place at: ${layout.subtitlePosition}
  • Logo placeholder (Rect/Image)→ Place at: ${layout.logoPosition}
  • Image / Graphic area         → Place at: ${layout.imagePosition}
  • Icons / Footer elements      → Place at: ${layout.iconPosition}

POSITION MAPPING (use these to calculate left/top coordinates):
${posMap}

STRICT LAYOUT OVERRIDES:
- You MUST position elements according to the layout mapping above.
- The layout structure takes priority over default element placement.
- If the layout specifies a sidebar, create a background Rect for it.
- Maintain the overall layout spatial relationships described in "${layout.name}".`,
    weight: 90,
  };
}

/** Builds a human-readable position mapping reference for the LLM. */
function buildPositionMapping(width: number, height: number): string {
  const hw = Math.round(width * 0.3);
  const rightStart = hw;
  const verticalThird = Math.round(height * 0.35);
  const verticalHalf = Math.round(height * 0.5);
  const verticalThreeQuarter = Math.round(height * 0.75);

  return `  • "top-left"         → left: 30-60,  top: 20-50
  • "top-center"       → left: centered, top: 20-60
  • "top-center-large" → left: centered, top: 20-40, width: 70-80% of canvas
  • "top-right"        → left: ${width - 250}-${width - 50}, top: 20-50
  • "center-left"      → left: 30-60,  top: ${verticalThird}-${verticalHalf}
  • "center"           → left: centered, top: ${verticalThird}-${verticalHalf}
  • "center-right"     → left: ${width - 280}-${width - 50}, top: ${verticalThird}-${verticalHalf}
  • "bottom-left"      → left: 30-60,  top: ${verticalThreeQuarter}-${height - 40}
  • "bottom-center"    → left: centered, top: ${verticalThreeQuarter}-${height - 40}
  • "bottom-right"     → left: ${width - 250}-${width - 50}, top: ${verticalThreeQuarter}-${height - 40}
  • "left-top"         → Inside a left sidebar panel (x: 0-${hw}), near top
  • "left-center"      → Inside a left sidebar panel, vertically centered
  • "left-bottom"      → Inside a left sidebar panel, near bottom
  • "right-top"        → Inside a right content area (x: ${rightStart}-${width}), near top
  • "right-center"     → Inside a right content area, vertically centered
  • "right-bottom"     → Inside a right content area, near bottom
  • "full-background"  → Full canvas background (Rect at 0,0 with full width/height)
  • "top-banner-*"     → Inside a colored banner strip at top of canvas (height ~80-120px)
  • "grid-cells"       → Arrange in evenly-spaced grid columns`;
}
