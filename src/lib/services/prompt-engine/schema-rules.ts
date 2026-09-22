/* ──────────────────────────────────────────────────────────
 * Fabric.js v7 Schema Rules
 *
 * Shared constraint block included in every compiled prompt.
 * Ensures the LLM only returns valid Fabric.js canvas JSON.
 * ────────────────────────────────────────────────────────── */

const SAFE_FONTS = ["Georgia", "Helvetica", "Arial", "Courier New", "Arial Black", "Impact", "Verdana", "Trebuchet MS"];

export function resolveFont(raw?: string): string | null {
  if (!raw) return null;
  const match = SAFE_FONTS.find((f) => f.toLowerCase() === raw.toLowerCase());
  return match ?? null;
}

export function getSafeFonts(): readonly string[] {
  return SAFE_FONTS;
}

/**
 * Builds the core schema rules block that constrains LLM output
 * to valid Fabric.js v7 canvas JSON.
 */
export function buildSchemaRulesBlock(width: number, height: number): string {
  return `CRITICAL RULES & AESTHETICS:
1. Return a JSON object with keys: designPlan, name, width, height, paperSize, canvasJson
2. designPlan contains the "image plan" (visual theme, layout grid, typography scale, asset placements) for this design. The AI agent MUST think and generate this plan FIRST before generating the JSON layout.
3. canvasJson has keys: version (always "7.0.0"), background (hex color string), objects (array)
4. Each object in the objects array MUST have ONLY the properties valid for its type:
   - Textbox: type, text, left, top, width, fontSize, fontFamily, fill, fontWeight, fontStyle, textAlign, charSpacing, lineHeight, name
   - Rect: type, left, top, width, height, fill, stroke, strokeWidth, rx, ry, name
   - Line: type, left, top, x1, y1, x2, y2, stroke, strokeWidth, name
   - Circle: type, left, top, radius, fill, stroke, strokeWidth, name
5. DO NOT mix properties across types. A Rect must NEVER have fontSize. A Textbox must NEVER have x1/y1/x2/y2. A Line must NEVER have width/height.
6. fontFamily MUST be one of: ${SAFE_FONTS.join(", ")}
7. All left/top positions must be within 0-${width} and 0-${height}
8. Use the centering formula: left = (${width} - elementWidth) / 2
9. DESIGN PHILOSOPHY: Always output clean, minimalist, modern, and high-contrast "premium" visual layouts.
10. GRID LAYOUT: Prioritize structural grid layouts. Simulate fixed column counts (e.g., a perfect 2-column layout) using absolute coordinates. Maintain balance and avoid uneven rows.
11. DYNAMIC FIELDS: All dynamic text fields MUST use bracketed template variables (e.g., {recipientName}, {issueDate}, {heroTitle}, {ctaLink}) unless specific double-bracket tags are requested by the Skill Set.`;
}

/**
 * Helper to center an object on the canvas.
 */
export function cx(canvasW: number, objW: number): number {
  return Math.round((canvasW - objW) / 2);
}
