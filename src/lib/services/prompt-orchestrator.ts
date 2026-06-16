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

/* ─────────────────────────────────────── */
interface CategoryDetails {
  exampleTemplate: Record<string, unknown>;
  instructions: string;
}

export function getCategoryDetails(
  category: string,
  width: number,
  height: number,
  paperSize: string
): CategoryDetails {
  const normCategory = category.toLowerCase().trim();

  if (normCategory === "youtube") {
    return {
      exampleTemplate: {
        name: "YouTube Thumbnail",
        width,
        height,
        paperSize,
        canvasJson: {
          version: "7.0.0",
          background: "#0f172a",
          objects: [
            { type: "Rect", left: 0, top: 0, width: width, height: height, fill: "#0f172a" },
            { type: "Rect", left: -50, top: -50, width: 300, height: 300, fill: "#3b82f6", opacity: 0.15, angle: 45 },
            { type: "Circle", left: width - 150, top: height - 150, radius: 150, fill: "#ec4899", opacity: 0.15 },
            { type: "Rect", left: 50, top: 180, width: 600, height: 110, fill: "#ef4444", rx: 8, ry: 8 },
            { type: "Textbox", text: "AMAZING", left: 70, top: 195, width: 560, fontSize: 64, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "left" },
            { type: "Textbox", text: "{{title}}", left: 50, top: 300, width: 800, fontSize: 50, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "left" },
            { type: "Textbox", text: "{{subtitle}}", left: 50, top: 370, width: 800, fontSize: 24, fontFamily: "Helvetica", fill: "#cbd5e1", fontWeight: "normal", textAlign: "left" },
            { type: "Rect", left: 50, top: 50, width: 140, height: 40, fill: "#10b981", rx: 20, ry: 20 },
            { type: "Textbox", text: "NEW VIDEO", left: 50, top: 60, width: 140, fontSize: 14, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" }
          ]
        }
      },
      instructions: `DESIGN EXCELLENCE REQUIREMENTS:
- High contrast, dark/vibrant background to grab attention on YouTube
- Bold, thick text overlays using Helvetica or Arial (avoid serif fonts like Georgia for thumbnails)
- Colored accent shapes (Rect or Circle) with opacity behind text to ensure legibility
- A colored callout banner/rect for a key high-impact word (like "AMAZING", "NEW", "TUTORIAL")
- Use placeholder merge tags: {{title}}, {{subtitle}}, {{author}}
- Keep elements away from the bottom-right corner to avoid being covered by the video duration overlay`
    };
  }

  if (normCategory === "invoice" || normCategory === "receipt") {
    return {
      exampleTemplate: {
        name: "Professional Invoice",
        width,
        height,
        paperSize,
        canvasJson: {
          version: "7.0.0",
          background: "#ffffff",
          objects: [
            { type: "Textbox", text: "INVOICE", left: 50, top: 50, width: 200, fontSize: 28, fontFamily: "Helvetica", fill: "#1e293b", fontWeight: "bold" },
            { type: "Textbox", text: "Invoice No: {{invoice_number}}\nDate: {{date}}", left: width - 250, top: 50, width: 200, fontSize: 12, fontFamily: "Helvetica", fill: "#64748b", textAlign: "right" },
            { type: "Textbox", text: "Billed To:", left: 50, top: 120, width: 200, fontSize: 11, fontFamily: "Helvetica", fill: "#64748b", fontWeight: "bold" },
            { type: "Textbox", text: "{{client_name}}\n{{client_email}}", left: 50, top: 140, width: 300, fontSize: 13, fontFamily: "Helvetica", fill: "#1e293b", lineHeight: 1.4 },
            { type: "Rect", left: 50, top: 220, width: width - 100, height: 35, fill: "#f1f5f9", rx: 4, ry: 4 },
            { type: "Textbox", text: "Description", left: 70, top: 230, width: 300, fontSize: 11, fontFamily: "Helvetica", fill: "#475569", fontWeight: "bold" },
            { type: "Textbox", text: "Amount", left: width - 170, top: 230, width: 100, fontSize: 11, fontFamily: "Helvetica", fill: "#475569", fontWeight: "bold", textAlign: "right" },
            { type: "Textbox", text: "{{item_description}}", left: 70, top: 280, width: 300, fontSize: 12, fontFamily: "Helvetica", fill: "#1e293b" },
            { type: "Textbox", text: "{{item_amount}}", left: width - 170, top: 280, width: 100, fontSize: 12, fontFamily: "Helvetica", fill: "#1e293b", textAlign: "right" },
            { type: "Line", left: 50, top: 310, x1: 0, y1: 0, x2: width - 100, y2: 0, stroke: "#e2e8f0", strokeWidth: 1 },
            { type: "Textbox", text: "Total Due:", left: width - 250, top: 340, width: 100, fontSize: 12, fontFamily: "Helvetica", fill: "#64748b", fontWeight: "bold", textAlign: "right" },
            { type: "Textbox", text: "{{total}}", left: width - 150, top: 340, width: 100, fontSize: 16, fontFamily: "Helvetica", fill: "#0f172a", fontWeight: "bold", textAlign: "right" }
          ]
        }
      },
      instructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Clean, grid-based corporate structure with professional tabular layout
- Dark gray/slate colors for text and light background colors for headers (e.g. #f1f5f9)
- Table header bar (Rect background) with aligned text elements
- Line separators (Line) to divide client info, items, and total
- Use placeholder merge tags: {{invoice_number}}, {{date}}, {{client_name}}, {{client_email}}, {{item_description}}, {{item_amount}}, {{total}}`
    };
  }

  if (normCategory === "resume") {
    return {
      exampleTemplate: {
        name: "Professional Resume",
        width,
        height,
        paperSize,
        canvasJson: {
          version: "7.0.0",
          background: "#ffffff",
          objects: [
            { type: "Rect", left: 0, top: 0, width: 240, height: height, fill: "#f8fafc" },
            { type: "Textbox", text: "{{name}}", left: 270, top: 50, width: 500, fontSize: 32, fontFamily: "Helvetica", fill: "#0f172a", fontWeight: "bold" },
            { type: "Textbox", text: "{{job_title}}", left: 270, top: 95, width: 500, fontSize: 16, fontFamily: "Helvetica", fill: "#6366f1", fontWeight: "bold" },
            { type: "Textbox", text: "CONTACT", left: 40, top: 80, width: 160, fontSize: 12, fontFamily: "Helvetica", fill: "#64748b", fontWeight: "bold", charSpacing: 100 },
            { type: "Line", left: 40, top: 100, x1: 0, y1: 0, x2: 160, y2: 0, stroke: "#cbd5e1", strokeWidth: 1 },
            { type: "Textbox", text: "Email:\n{{email}}\n\nPhone:\n{{phone}}", left: 40, top: 115, width: 160, fontSize: 10, fontFamily: "Helvetica", fill: "#334155", lineHeight: 1.5 },
            { type: "Textbox", text: "PROFESSIONAL EXPERIENCE", left: 270, top: 150, width: 500, fontSize: 14, fontFamily: "Helvetica", fill: "#1e293b", fontWeight: "bold", charSpacing: 100 },
            { type: "Line", left: 270, top: 170, x1: 0, y1: 0, x2: width - 320, y2: 0, stroke: "#cbd5e1", strokeWidth: 1 },
            { type: "Textbox", text: "{{company_name}} — {{job_role}}\n{{work_duration}}", left: 270, top: 185, width: 500, fontSize: 12, fontFamily: "Helvetica", fill: "#0f172a", fontWeight: "bold" },
            { type: "Textbox", text: "• Managed core components and led frontend feature migrations.\n• Collaborated with design teams to structure unified assets.", left: 270, top: 215, width: 500, fontSize: 11, fontFamily: "Helvetica", fill: "#475569", lineHeight: 1.6 }
          ]
        }
      },
      instructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Modern multi-column layout (a sidebar Rect for contact/skills, and a main area for content)
- Clear typographical hierarchy with bold headings and muted body text
- Fine horizontal separator Lines below section titles
- Bullet points (•) for professional listing
- Use placeholder merge tags: {{name}}, {{job_title}}, {{email}}, {{phone}}, {{company_name}}, {{job_role}}, {{work_duration}}`
    };
  }

  if (normCategory === "email") {
    return {
      exampleTemplate: {
        name: "Email Newsletter",
        width,
        height,
        paperSize,
        canvasJson: {
          version: "7.0.0",
          background: "#f8fafc",
          objects: [
            { type: "Rect", left: cx(width, 600), top: 40, width: 600, height: height - 80, fill: "#ffffff", rx: 8, ry: 8 },
            { type: "Rect", left: cx(width, 600), top: 40, width: 600, height: 120, fill: "#6366f1", rx: 8, ry: 8 },
            { type: "Textbox", text: "WEEKLY NEWSLETTER", left: cx(width, 560), top: 85, width: 560, fontSize: 24, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
            { type: "Textbox", text: "Hello {{recipient}},", left: cx(width, 520), top: 190, width: 520, fontSize: 16, fontFamily: "Helvetica", fill: "#1e293b", fontWeight: "bold" },
            { type: "Textbox", text: "{{body_text}}", left: cx(width, 520), top: 230, width: 520, fontSize: 13, fontFamily: "Helvetica", fill: "#475569", lineHeight: 1.6 },
            { type: "Rect", left: cx(width, 200), top: height - 180, width: 200, height: 45, fill: "#6366f1", rx: 6, ry: 6 },
            { type: "Textbox", text: "Read Full Article", left: cx(width, 200), top: height - 167, width: 200, fontSize: 13, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
            { type: "Line", left: cx(width, 520), top: height - 100, x1: 0, y1: 0, x2: 520, y2: 0, stroke: "#e2e8f0", strokeWidth: 1 },
            { type: "Textbox", text: "© 2026 Nexrover Inc. All rights reserved.\nYou are receiving this email because you subscribed to our list.", left: cx(width, 520), top: height - 85, width: 520, fontSize: 10, fontFamily: "Helvetica", fill: "#94a3b8", textAlign: "center", lineHeight: 1.4 }
          ]
        }
      },
      instructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Centered container/card design using a large white Rect background on a light gray canvas background
- A distinct colorful header banner (Rect) for email title
- Call-to-action button (overlapping Rect + Textbox) styled with high-contrast background
- Light divider lines and footer info at the bottom
- Use placeholder merge tags: {{recipient}}, {{body_text}}`
    };
  }

  // Fallback: Certificate
  return {
    exampleTemplate: buildExampleTemplate(width, height, paperSize),
    instructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Use at least 10-15 objects for a rich, layered design
- Create clear visual hierarchy: large bold title → medium subtitle → smaller body text
- Use decorative borders (double border with outer stroke + inner stroke)
- Include horizontal divider Lines between sections
- Include placeholder text with merge tags: {{name}}, {{course}}, {{issued_date}}, {{certificate_id}}, {{issuer_name}}
- Place signature blocks at the bottom with "________________________" lines
- Add small certificate ID text at the very bottom
- Space elements vertically with adequate margins (at least 20-30px between sections)`
  };
}

export function buildBrandKitSystemPrompt(
  brandKit: BrandKit,
  width: number,
  height: number,
  paperSize: string,
  category: string,
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
  const SAFE_FONTS = ["Georgia", "Helvetica", "Arial", "Courier New"];
  const resolveFont = (raw?: string) => {
    if (!raw) return null;
    const match = SAFE_FONTS.find((f) => f.toLowerCase() === raw.toLowerCase());
    return match ?? null;
  };

  const titleFont = resolveFont(typography?.title) ?? "Georgia";
  const subtitleFont = resolveFont(typography?.subtitle) ?? titleFont;
  const bodyFont = resolveFont(typography?.body) ?? "Helvetica";

  const { exampleTemplate, instructions } = getCategoryDetails(category, width, height, paperSize);

  return `You are a world-class graphic designer specialising in Fabric.js v7 canvas templates.
You MUST return ONLY valid JSON. No markdown, no code fences, no explanation.

TARGET CANVAS:
- Width: ${width}px, Height: ${height}px
- Paper Size: ${paperSize}
- Style: ${style}
- Category: ${category}

Interface type template category details:
- You are designing a: ${category}

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

${instructions}

HERE IS AN EXCELLENT EXAMPLE of the exact JSON structure you must follow:
${JSON.stringify(exampleTemplate, null, 2)}

Now generate a DIFFERENT, unique, beautiful template that STRICTLY uses the "${brandName}" brand kit colours and typography defined above. Be creative with the layout while adhering to every constraint.`;
}

export function buildDefaultSystemPrompt(
  width: number,
  height: number,
  paperSize: string,
  category: string,
  style: string
): string {
  const { exampleTemplate, instructions } = getCategoryDetails(category, width, height, paperSize);

  return `You are a world-class graphic designer specializing in Fabric.js v7 canvas templates.
You MUST return ONLY valid JSON. No markdown, no code fences, no explanation.

TARGET CANVAS:
- Width: ${width}px, Height: ${height}px
- Paper Size: ${paperSize}
- Style: ${style}
- Category: ${category}

Interface type template category details:
- You are designing a: ${category}

${coreSchemaRules(width, height)}

${instructions}

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
