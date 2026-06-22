/* ──────────────────────────────────────────────────────────
 * Fabric.js v7 Schema Rules
 *
 * Shared constraint block included in every compiled prompt.
 * Ensures the LLM only returns valid Fabric.js canvas JSON.
 * ────────────────────────────────────────────────────────── */

const SAFE_FONTS = ["Georgia", "Helvetica", "Arial", "Courier New"];

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
  return `CRITICAL RULES:
1. Return a JSON object with keys: name, width, height, paperSize, canvasJson
2. canvasJson has keys: version (always "7.0.0"), background (hex color string), objects (array)
3. Each object in the objects array MUST have ONLY the properties valid for its type:
   - Textbox: type, text, left, top, width, fontSize, fontFamily, fill, fontWeight, fontStyle, textAlign, charSpacing, lineHeight
   - Rect: type, left, top, width, height, fill, stroke, strokeWidth, rx, ry
   - Line: type, left, top, x1, y1, x2, y2, stroke, strokeWidth
   - Circle: type, left, top, radius, fill, stroke, strokeWidth
4. DO NOT mix properties across types. A Rect must NEVER have fontSize. A Textbox must NEVER have x1/y1/x2/y2. A Line must NEVER have width/height.
5. fontFamily MUST be one of: ${SAFE_FONTS.join(", ")}
6. All left/top positions must be within 0-${width} and 0-${height}
7. Use the centering formula: left = (${width} - elementWidth) / 2`;
}

/**
 * Helper to center an object on the canvas.
 */
export function cx(canvasW: number, objW: number): number {
  return Math.round((canvasW - objW) / 2);
}
