import type { BrandKit } from "@/lib/types";

/* ──────────────────────────────────────────────────────────
 * Prompt Orchestrator
 *
 * Centralised prompt-structuring module for the AI template
 * generation pipeline.
 *
 * Two execution paths:
 *   Condition A  — Brand Kit is active  → constrained output
 *   Condition B  — No preset active     → generalized fallback
 * ────────────────────────────────────────────────────────── */

/* ── Shared helpers ─────────────────────────────────────── */

function cx(canvasW: number, objW: number) {
  return Math.round((canvasW - objW) / 2);
}

/** Build an example template JSON that is included in both paths. */
function buildExampleTemplate(
  width: number,
  height: number,
  paperSize: string
) {
  return {
    name: "Course Completion Certificate",
    width,
    height,
    paperSize,
    canvasJson: {
      version: "7.0.0",
      background: "#ffffff",
      objects: [
        { type: "Rect", left: 20, top: 20, width: width - 40, height: height - 40, fill: "transparent", stroke: "#1e3a5f", strokeWidth: 3, rx: 8, ry: 8 },
        { type: "Rect", left: 30, top: 30, width: width - 60, height: height - 60, fill: "transparent", stroke: "#c9a84c", strokeWidth: 1.5, rx: 4, ry: 4 },
        { type: "Textbox", text: "CERTIFICATE", left: cx(width, 500), top: 60, width: 500, fontSize: 14, fontFamily: "Georgia", fill: "#c9a84c", fontWeight: "normal", textAlign: "center", charSpacing: 600 },
        { type: "Textbox", text: "OF COMPLETION", left: cx(width, 600), top: 90, width: 600, fontSize: 36, fontFamily: "Georgia", fill: "#1e3a5f", fontWeight: "bold", textAlign: "center" },
        { type: "Textbox", text: "This is to certify that", left: cx(width, 500), top: 160, width: 500, fontSize: 14, fontFamily: "Georgia", fill: "#555555", textAlign: "center" },
        { type: "Textbox", text: "{{name}}", left: cx(width, 500), top: 195, width: 500, fontSize: 32, fontFamily: "Georgia", fill: "#1e3a5f", fontWeight: "bold", textAlign: "center" },
        { type: "Line", left: cx(width, 400), top: 245, x1: 0, y1: 0, x2: 400, y2: 0, stroke: "#c9a84c", strokeWidth: 1 },
        { type: "Textbox", text: "has successfully completed the course requirements.", left: cx(width, 600), top: 265, width: 600, fontSize: 13, fontFamily: "Georgia", fill: "#555555", textAlign: "center", lineHeight: 1.6 },
        { type: "Textbox", text: "Issued on {{issued_date}}", left: cx(width, 400), top: 345, width: 400, fontSize: 12, fontFamily: "Georgia", fill: "#777777", textAlign: "center" },
        { type: "Textbox", text: "________________________\n{{issuer_name}}\nInstructor", left: 190, top: 430, width: 200, fontSize: 11, fontFamily: "Georgia", fill: "#333333", textAlign: "center", lineHeight: 1.5 },
        { type: "Textbox", text: "________________________\nAuthorized Signature\nDirector", left: 460, top: 430, width: 200, fontSize: 11, fontFamily: "Georgia", fill: "#333333", textAlign: "center", lineHeight: 1.5 },
        { type: "Textbox", text: "Certificate ID: {{certificate_id}}", left: cx(width, 300), top: height - 50, width: 300, fontSize: 9, fontFamily: "Georgia", fill: "#999999", textAlign: "center" },
      ],
    },
  };
}

/** Core schema rules shared by both Condition A and Condition B. */
function coreSchemaRules(width: number, height: number) {
  return `CRITICAL RULES:
1. Return a JSON object with keys: name, width, height, paperSize, canvasJson
2. canvasJson has keys: version (always "7.0.0"), background (hex color string), objects (array)
3. Each object in the objects array MUST have ONLY the properties valid for its type:
   - Textbox: type, text, left, top, width, fontSize, fontFamily, fill, fontWeight, fontStyle, textAlign, charSpacing, lineHeight
   - Rect: type, left, top, width, height, fill, stroke, strokeWidth, rx, ry
   - Line: type, left, top, x1, y1, x2, y2, stroke, strokeWidth
   - Circle: type, left, top, radius, fill, stroke, strokeWidth
4. DO NOT mix properties across types. A Rect must NEVER have fontSize. A Textbox must NEVER have x1/y1/x2/y2. A Line must NEVER have width/height.
5. fontFamily MUST be one of: "Georgia", "Helvetica", "Arial", "Courier New"
6. All left/top positions must be within 0-${width} and 0-${height}
7. Use the centering formula: left = (${width} - elementWidth) / 2`;
}

/* ────────────────────────────────────────────────────────── */
/*  CONDITION A — Brand Kit Active                          */
/* ────────────────────────────────────────────────────────── */

/**
 * Build a system prompt that hard-constrains the AI output to
 * the brand kit's colour palette, typography, and identity.
 *
 * The resulting template will NOT use random colours or fonts —
 * everything is locked to the brand reference.
 */
export function buildBrandKitSystemPrompt(
  brandKit: BrandKit,
  width: number,
  height: number,
  paperSize: string,
  style: string
): string {
  const { colors, typography, name: brandName } = brandKit;

  // ── Colour constraint block ──────────────────────────────
  const colorList = colors.length > 0 ? colors.join(", ") : "#1e3a5f, #c9a84c, #333333, #777777";
  const primaryColor = colors[0] ?? "#1e3a5f";
  const accentColor = colors[1] ?? "#c9a84c";
  const textDark = colors[2] ?? "#333333";
  const textMuted = colors[3] ?? "#777777";

  // ── Typography constraint block ──────────────────────────
  // Only allow the safe web-font subset Fabric.js can render.
  const SAFE_FONTS = ["Georgia", "Helvetica", "Arial", "Courier New"];
  const resolveFont = (raw?: string) => {
    if (!raw) return null;
    // If the brand font exactly matches a safe font, use it
    const match = SAFE_FONTS.find((f) => f.toLowerCase() === raw.toLowerCase());
    return match ?? null;
  };

  const titleFont = resolveFont(typography?.title) ?? "Georgia";
  const subtitleFont = resolveFont(typography?.subtitle) ?? titleFont;
  const bodyFont = resolveFont(typography?.body) ?? "Helvetica";

  // ── Example template ─────────────────────────────────────
  const exampleTemplate = buildExampleTemplate(width, height, paperSize);

  return `You are a world-class graphic designer specialising in Fabric.js v7 canvas templates.
You MUST return ONLY valid JSON. No markdown, no code fences, no explanation.

TARGET CANVAS:
- Width: ${width}px, Height: ${height}px
- Paper Size: ${paperSize}
- Style: ${style}

═══════════════════════════════════════════════════════
 BRAND KIT CONSTRAINT MODE (ACTIVE)
 Brand: "${brandName}"
═══════════════════════════════════════════════════════

ALLOWED_COLORS — You MUST ONLY use these hex values throughout the
entire design (background, fills, strokes, text fills). Using any
colour outside this list is a CRITICAL VIOLATION:
  ${colorList}

Colour role mapping:
  • Primary / headings / borders   → ${primaryColor}
  • Accent / decorations / dividers → ${accentColor}
  • Body text (dark)               → ${textDark}
  • Muted / secondary text         → ${textMuted}
  • Background                     → Use white (#ffffff) or the lightest brand colour

TYPOGRAPHY BINDINGS — Every Textbox MUST use these exact fontFamily values:
  • Title / heading Textbox  → fontFamily: "${titleFont}"
  • Subtitle Textbox         → fontFamily: "${subtitleFont}"
  • Body / paragraph Textbox → fontFamily: "${bodyFont}"

STRICT OVERRIDES:
- Do NOT randomly generate colours or fonts. Strictly follow the brand constraints above.
- Do NOT use any colour hex value that is not listed in ALLOWED_COLORS.
- The overall design should feel cohesive with the "${brandName}" brand identity.

${coreSchemaRules(width, height)}

DESIGN EXCELLENCE REQUIREMENTS:
- Use at least 10-15 objects for a rich, layered design
- Create clear visual hierarchy: large bold title → medium subtitle → smaller body text
- Use decorative borders (double border with outer stroke + inner stroke)
- Include horizontal divider Lines between sections
- Include placeholder text with merge tags: {{name}}, {{course}}, {{issued_date}}, {{certificate_id}}, {{issuer_name}}
- Place signature blocks at the bottom with "________________________" lines
- Add small certificate ID text at the very bottom
- Space elements vertically with adequate margins (at least 20-30px between sections)

HERE IS AN EXCELLENT EXAMPLE of the exact JSON structure you must follow:
${JSON.stringify(exampleTemplate, null, 2)}

Now generate a DIFFERENT, unique, beautiful template that STRICTLY uses the "${brandName}" brand kit colours and typography defined above. Be creative with the layout while adhering to every constraint.`;
}

/* ────────────────────────────────────────────────────────── */
/*  CONDITION B — No Preset Active (Generalized Fallback)   */
/* ────────────────────────────────────────────────────────── */

/**
 * Build the standard, unconstrained system prompt.
 * The AI is free to pick any harmonious palette and creative layout.
 *
 * This is functionally identical to the legacy inline prompt that was
 * previously hardcoded in the generate route.
 */
export function buildDefaultSystemPrompt(
  width: number,
  height: number,
  paperSize: string,
  style: string
): string {
  const exampleTemplate = buildExampleTemplate(width, height, paperSize);

  return `You are a world-class graphic designer specializing in Fabric.js v7 canvas templates.
You MUST return ONLY valid JSON. No markdown, no code fences, no explanation.

TARGET CANVAS:
- Width: ${width}px, Height: ${height}px
- Paper Size: ${paperSize}
- Style: ${style}

${coreSchemaRules(width, height)}

DESIGN EXCELLENCE REQUIREMENTS:
- Use at least 10-15 objects for a rich, layered design
- Create clear visual hierarchy: large bold title → medium subtitle → smaller body text
- Use decorative borders (double border with outer stroke + inner stroke is highly effective)
- Include horizontal divider Lines between sections
- Use a harmonious 3-4 color palette (e.g., navy #1e3a5f + gold #c9a84c + dark text #333333 + muted gray #777777)
- Include placeholder text with merge tags: {{name}}, {{course}}, {{issued_date}}, {{certificate_id}}, {{issuer_name}}
- Place signature blocks at the bottom with "________________________" lines
- Add small certificate ID text at the very bottom
- Space elements vertically with adequate margins (at least 20-30px between sections)

HERE IS AN EXCELLENT EXAMPLE of the exact JSON structure you must follow:
${JSON.stringify(exampleTemplate, null, 2)}

Now generate a DIFFERENT, unique, beautiful template based on the user's prompt. Use a different color scheme and layout than the example. Be creative with the design while following the exact same JSON structure.`;
}

/* ────────────────────────────────────────────────────────── */
/*  Auto-paste Suggestion Prompt Generator                  */
/* ────────────────────────────────────────────────────────── */

/**
 * Generate a ready-to-use descriptive prompt that auto-populates
 * the AI Design textarea when the user selects a brand kit.
 *
 * This gives the user a helpful starting point they can refine.
 */
export function generateBrandKitSuggestionPrompt(
  brandKit: BrandKit,
  category: string
): string {
  const { name: brandName, colors, typography } = brandKit;

  // Human-readable colour description
  const colorDesc =
    colors.length > 0
      ? colors.length <= 3
        ? colors.join(", ")
        : `${colors.slice(0, 3).join(", ")} and ${colors.length - 3} more`
      : "brand colours";

  // Human-readable font description
  const fontParts: string[] = [];
  if (typography?.title) fontParts.push(`"${typography.title}" for titles`);
  if (typography?.body) fontParts.push(`"${typography.body}" for body text`);
  const fontDesc = fontParts.length > 0 ? fontParts.join(" and ") : "brand typography";

  // Category-specific flavour text
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
