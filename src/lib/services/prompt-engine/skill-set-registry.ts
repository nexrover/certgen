import { cx } from "./schema-rules";

/* ──────────────────────────────────────────────────────────
 * Skill Set Registry
 *
 * Extensible catalog that maps skill set identifiers to their
 * design constraints, example templates, merge tags, and
 * category-specific instructions. Each entry is a polymorphic
 * design structure that the prompt compiler can compose from.
 *
 * To add a new skill set, register it via `registerSkillSet()`.
 * ────────────────────────────────────────────────────────── */

export interface SkillSetEntry {
  /** Unique identifier matching UI skill set values. */
  id: string;

  /** Human-readable display name. */
  label: string;

  /** Merge tag placeholders available in this skill set. */
  mergeTags: string[];

  /** Category-specific design instructions for the LLM. */
  designInstructions: string;

  /** Factory that builds an example template JSON for the given dimensions. */
  exampleFactory: (width: number, height: number, paperSize: string) => Record<string, unknown>;
}

/* ── Internal Registry ──────────────────────────────────── */

const registry = new Map<string, SkillSetEntry>();

function register(entry: SkillSetEntry): void {
  registry.set(entry.id, entry);
}

/* ── Built-in Skill Sets ────────────────────────────────── */

register({
  id: "certificate",
  label: "Certificate",
  mergeTags: ["{{name}}", "{{course}}", "{{issued_date}}", "{{certificate_id}}", "{{issuer_name}}"],
  designInstructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Use at least 10-15 objects for a rich, layered design
- Create clear visual hierarchy: large bold title → medium subtitle → smaller body text
- Use decorative borders (double border with outer stroke + inner stroke)
- Include horizontal divider Lines between sections
- Include placeholder text with merge tags: {{name}}, {{course}}, {{issued_date}}, {{certificate_id}}, {{issuer_name}}
- Place signature blocks at the bottom with "________________________" lines
- Add small certificate ID text at the very bottom
- Space elements vertically with adequate margins (at least 20-30px between sections)`,
  exampleFactory: (w, h, ps) => ({
    name: "Course Completion Certificate",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#ffffff",
      objects: [
        { type: "Rect", left: 20, top: 20, width: w - 40, height: h - 40, fill: "transparent", stroke: "#1e3a5f", strokeWidth: 3, rx: 8, ry: 8 },
        { type: "Rect", left: 30, top: 30, width: w - 60, height: h - 60, fill: "transparent", stroke: "#c9a84c", strokeWidth: 1.5, rx: 4, ry: 4 },
        { type: "Textbox", text: "CERTIFICATE", left: cx(w, 500), top: 60, width: 500, fontSize: 14, fontFamily: "Georgia", fill: "#c9a84c", fontWeight: "normal", textAlign: "center", charSpacing: 600 },
        { type: "Textbox", text: "OF COMPLETION", left: cx(w, 600), top: 90, width: 600, fontSize: 36, fontFamily: "Georgia", fill: "#1e3a5f", fontWeight: "bold", textAlign: "center" },
        { type: "Textbox", text: "This is to certify that", left: cx(w, 500), top: 160, width: 500, fontSize: 14, fontFamily: "Georgia", fill: "#555555", textAlign: "center" },
        { type: "Textbox", text: "{{name}}", left: cx(w, 500), top: 195, width: 500, fontSize: 32, fontFamily: "Georgia", fill: "#1e3a5f", fontWeight: "bold", textAlign: "center" },
        { type: "Line", left: cx(w, 400), top: 245, x1: 0, y1: 0, x2: 400, y2: 0, stroke: "#c9a84c", strokeWidth: 1 },
        { type: "Textbox", text: "has successfully completed the course requirements.", left: cx(w, 600), top: 265, width: 600, fontSize: 13, fontFamily: "Georgia", fill: "#555555", textAlign: "center", lineHeight: 1.6 },
        { type: "Textbox", text: "Issued on {{issued_date}}", left: cx(w, 400), top: 345, width: 400, fontSize: 12, fontFamily: "Georgia", fill: "#777777", textAlign: "center" },
        { type: "Textbox", text: "________________________\n{{issuer_name}}\nInstructor", left: 190, top: 430, width: 200, fontSize: 11, fontFamily: "Georgia", fill: "#333333", textAlign: "center", lineHeight: 1.5 },
        { type: "Textbox", text: "________________________\nAuthorized Signature\nDirector", left: 460, top: 430, width: 200, fontSize: 11, fontFamily: "Georgia", fill: "#333333", textAlign: "center", lineHeight: 1.5 },
        { type: "Textbox", text: "Certificate ID: {{certificate_id}}", left: cx(w, 300), top: h - 50, width: 300, fontSize: 9, fontFamily: "Georgia", fill: "#999999", textAlign: "center" },
      ],
    },
  }),
});

register({
  id: "youtube",
  label: "YouTube Thumbnail",
  mergeTags: ["{{title}}", "{{subtitle}}", "{{author}}", "{{emoji}}", "{{badge}}", "{{counter}}"],
  designInstructions: `═══════════════════════════════════════════════════════
 YOUTUBE THUMBNAIL MASTER SKILL SET — HIGH CTR DESIGN ENGINE
═══════════════════════════════════════════════════════

═══ 1. CORE DESIGN PRINCIPLES (MANDATORY FOR EVERY THUMBNAIL) ═══

A. RULE OF THIRDS (Focus Composition)
- Position the primary subject (person, object, animal) on either the LEFT or RIGHT THIRD of the frame.
- Ensure ONE SIDE has clean NEGATIVE SPACE for clear, large text (3-5 powerful words max).
- The thumbnail title explains, the thumbnail hooks — never duplicate the title.

B. HIGH CONTRAST & VIBRANT COLOR SEPARATION
- Subject-Background Contrast: Main subject MUST contrast sharply with background. Use outer glow, heavy drop shadow, or light edge blur to make subjects "pop".
- Text Contrast: ALWAYS use bright text (white #FFFFFF, yellow #FFD700, neon #00FF88) against dark backgrounds OR dark text (#1a1a1a) with strong dark drop shadow.
- Vibrance: Saturate and enhance key colors. Vibrant thumbnails grab more attention.
- Minimum contrast ratio: 4.5:1 for all text against background.

C. READABILITY ON MOBILE (Critical — 70%+ of views are mobile)
- TEXT LIMIT: Maximum 3-5 powerful, high-impact words. NEVER exceed 5 words.
- FONT CHOICE: Use ONLY extremely bold, heavy, thick sans-serif fonts: Arial Black, Helvetica Bold, Montserrat ExtraBold. NEVER use serif, script, handwritten, or thin fonts.
- SAFE ZONES: NEVER place essential elements (text, logos, facial expressions) in the BOTTOM-RIGHT corner (reserved for video timestamp overlay 00:00).
- Minimum font size: 48px for headlines, 24px for subtitles.

D. EMOTIONAL HOOK & FACIAL FOCUS
- Facial Expressiveness: If a person is in the thumbnail, their expression MUST be HIGH-EMOTION (shocked, laughing, serious, curious, amazed).
- Direct Eye Contact: The subject should make eye contact with the viewer OR point/gesture towards the main object/text hook.
- Human faces increase CTR by 30-50% — always include when relevant.

═══ 2. COMPOSITION STRATEGIES BY NICHE (Auto-Select Based on Topic) ═══

Based on the user's video topic, automatically select ONE composition strategy:

CATEGORY A: Travel, Outdoor & Lifestyle Vlogs
- Composition: Medium shot or medium-long shot of the vlogger
- Focus: Blend scenic wide-angle background with prominent, happy/adventurous vlogger. Use dramatic lighting (golden hour).
- Color Palette: Warm, sun-kissed, natural, vivid blues (#00B4D8) and greens (#2ECC71).
- Emotional Tone: Adventure, excitement, wanderlust.

CATEGORY B: Technology, Reviews & Gadgets
- Composition: Close-up of the product (the hero) in ONE-THIRD, and the host in the OTHER third.
- Focus: Crisp, detailed shots with professional studio lighting. Focus on texture. Use depth of field (blurry background effect).
- Color Palette: Clean, futuristic, high-contrast. Dark mode (#0D1117) with neon accents (#00D4FF, #7C3AED).
- Emotional Tone: Innovation, premium quality, cutting-edge.

CATEGORY C: Education, Productivity & Tutorials (Problem/Solution Structure)
- Composition: Direct headshot (or subject) on ONE side, key informational graphic/text on the OTHER.
- Focus: Simplicity. Highlight the "Before/After" or "The Result" visually. Clear information hierarchy.
- Color Palette: Professional, clean, energetic. Use subject-specific colors (green #27AE60 for finance, blue #2563EB for trust/tech).
- Emotional Tone: Knowledge, transformation, results.

CATEGORY D: Gaming, Entertainment & Highlights
- Composition: Action-oriented close-up or highly dynamic character pose (Rule of Thirds). Text in empty space.
- Focus: Drama, movement, explosive visual effects. Use motion blur or energy effects.
- Color Palette: Intense, aggressive, high-saturation neon (red #FF3B30, purple #AF52DE, orange #FF9500).
- Emotional Tone: Excitement, intensity, epic moments.

═══ 3. MICRO-ELEMENTS & PSYCHOLOGICAL HOOKS (Engagement Boosters) ═══

Incorporate these subtle elements to increase interest and CTR:

A. EMOTIONAL EMOJIS
- Insert highly relevant emojis naturally near the text or subject.
- Examples: 😍 (beauty/lifestyle), 😱 (shocking reveals), 🤔 (mystery/curiosity), 💰 (money/finance), 🔥 (trending/hot), ⚡ (speed/tech), 🎮 (gaming).
- Use merge tag {{emoji}} or embed directly. Max 1-2 emojis per thumbnail.

B. SUBTLE BADGES & ICONS
- Small badges or icons for credentials when applicable: verified checkmark ✓, currency symbol ($, €), location pin 📍, fire icon 🔥.
- Place in corners or near subject to establish authority/credibility.

C. PROGRESS BARS & COUNTERS
- For "Transformation" or "Goal" videos: "0 to $10,000", "Before/After", "30 Day Challenge".
- Visual progress bar element using Rect with gradient fill.
- Use merge tag {{counter}} for dynamic values.

D. DIRECTIONAL CUES
- Use the subject's arm, finger, or an explicit arrow/circle to direct viewer's eye to the main hook.
- Create visual flow: Subject → Arrow/Gesture → Text Hook → CTA.

═══ 4. TECHNICAL OUTPUT SPECIFICATIONS ═══

- Aspect Ratio: STRICTLY 16:9 (Landscape) — 1280×720 pixels minimum.
- Resolution: Always generate at 1280×720 or higher (1920×1080 preferred).
- Style: DEFAULT to high-quality, professional photograph style unless explicitly requested otherwise.
- Clarity: Sharp focus on main subject; background can have relevant depth-of-field blur.
- File Format: Design for PNG/JPG export with clean edges.

═══ 5. TEXT HIERARCHY RULES ═══

- Headline (Primary): 64-80px, Bold/Black weight, ALL CAPS or Title Case, maximum 3-5 words.
- Subheadline (Secondary): 24-36px, Medium weight, supporting context.
- Badge/Label: 14-18px, Bold, inside colored pill/rectangle shape.
- NEVER use more than 2-3 text elements total.
- Text must have drop shadow or outline for readability over any background.

═══ 6. COLOR THEORY FOR YOUTUBE ═══

- RED (#FF0000, #EF4444): Urgency, excitement, passion — highest CTR color.
- YELLOW (#FFD700, #FFC107): Optimism, attention, warmth — stands out in feed.
- BLUE (#3B82F6, #0066FF): Trust, technology, professionalism.
- GREEN (#10B981, #2ECC71): Growth, money, nature, success.
- PURPLE (#8B5CF6, #7C3AED): Luxury, creativity, mystery.
- ORANGE (#F97316, #FF9500): Energy, enthusiasm, fun.
- Use MAX 2-3 colors per thumbnail for cohesion.

═══ 7. ANTI-PATTERNS (NEVER DO THESE) ═══

- NEVER use more than 5 words of text.
- NEVER use thin, light, or decorative fonts.
- NEVER place text in bottom-right corner (timestamp zone).
- NEVER use low-contrast text (light gray on white, dark on dark).
- NEVER create cluttered designs with too many elements (max 8-10 objects).
- NEVER use generic stock photo aesthetics — aim for authentic, dynamic feel.
- NEVER make text smaller than 24px.
- NEVER use more than 3 colors per thumbnail.`,
  exampleFactory: (w, h, ps) => ({
    name: "YouTube Thumbnail",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#0f172a",
      objects: [
        { type: "Rect", left: 0, top: 0, width: w, height: h, fill: "#0f172a" },
        { type: "Rect", left: -50, top: -50, width: 350, height: 350, fill: "#FF0000", opacity: 0.12, angle: 45 },
        { type: "Circle", left: w - 180, top: h - 180, radius: 200, fill: "#FFD700", opacity: 0.1 },
        { type: "Rect", left: 60, top: 40, width: 160, height: 45, fill: "#FF0000", rx: 22, ry: 22 },
        { type: "Textbox", text: "🔥 NEW", left: 60, top: 50, width: 160, fontSize: 18, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
        { type: "Rect", left: 60, top: 160, width: 650, height: 120, fill: "#000000", rx: 10, ry: 10, opacity: 0.7 },
        { type: "Textbox", text: "AMAZING", left: 80, top: 175, width: 610, fontSize: 72, fontFamily: "Helvetica", fill: "#FFD700", fontWeight: "bold", textAlign: "left" },
        { type: "Textbox", text: "{{title}}", left: 60, top: 290, width: 800, fontSize: 48, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "left" },
        { type: "Textbox", text: "{{subtitle}}", left: 60, top: 350, width: 700, fontSize: 24, fontFamily: "Helvetica", fill: "#94a3b8", fontWeight: "normal", textAlign: "left" },
        { type: "Rect", left: 60, top: 420, width: 200, height: 40, fill: "#10b981", rx: 20, ry: 20 },
        { type: "Textbox", text: "WATCH NOW →", left: 60, top: 428, width: 200, fontSize: 14, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
        { type: "Circle", left: w - 200, top: 60, radius: 45, fill: "#FFD700", opacity: 0.9 },
        { type: "Textbox", text: "😱", left: w - 185, top: 72, width: 30, fontSize: 28, fontFamily: "Helvetica", fill: "#000000", textAlign: "center" },
      ],
    },
  }),
});

register({
  id: "invoice",
  label: "Invoice",
  mergeTags: ["{{invoice_number}}", "{{date}}", "{{client_name}}", "{{client_email}}", "{{item_description}}", "{{item_amount}}", "{{total}}"],
  designInstructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Clean, grid-based corporate structure with professional tabular layout
- Dark gray/slate colors for text and light background colors for headers (e.g. #f1f5f9)
- Table header bar (Rect background) with aligned text elements
- Line separators (Line) to divide client info, items, and total
- Use placeholder merge tags: {{invoice_number}}, {{date}}, {{client_name}}, {{client_email}}, {{item_description}}, {{item_amount}}, {{total}}`,
  exampleFactory: (w, h, ps) => ({
    name: "Professional Invoice",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#ffffff",
      objects: [
        { type: "Textbox", text: "INVOICE", left: 50, top: 50, width: 200, fontSize: 28, fontFamily: "Helvetica", fill: "#1e293b", fontWeight: "bold" },
        { type: "Textbox", text: "Invoice No: {{invoice_number}}\nDate: {{date}}", left: w - 250, top: 50, width: 200, fontSize: 12, fontFamily: "Helvetica", fill: "#64748b", textAlign: "right" },
        { type: "Textbox", text: "Billed To:", left: 50, top: 120, width: 200, fontSize: 11, fontFamily: "Helvetica", fill: "#64748b", fontWeight: "bold" },
        { type: "Textbox", text: "{{client_name}}\n{{client_email}}", left: 50, top: 140, width: 300, fontSize: 13, fontFamily: "Helvetica", fill: "#1e293b", lineHeight: 1.4 },
        { type: "Rect", left: 50, top: 220, width: w - 100, height: 35, fill: "#f1f5f9", rx: 4, ry: 4 },
        { type: "Textbox", text: "Description", left: 70, top: 230, width: 300, fontSize: 11, fontFamily: "Helvetica", fill: "#475569", fontWeight: "bold" },
        { type: "Textbox", text: "Amount", left: w - 170, top: 230, width: 100, fontSize: 11, fontFamily: "Helvetica", fill: "#475569", fontWeight: "bold", textAlign: "right" },
        { type: "Textbox", text: "{{item_description}}", left: 70, top: 280, width: 300, fontSize: 12, fontFamily: "Helvetica", fill: "#1e293b" },
        { type: "Textbox", text: "{{item_amount}}", left: w - 170, top: 280, width: 100, fontSize: 12, fontFamily: "Helvetica", fill: "#1e293b", textAlign: "right" },
        { type: "Line", left: 50, top: 310, x1: 0, y1: 0, x2: w - 100, y2: 0, stroke: "#e2e8f0", strokeWidth: 1 },
        { type: "Textbox", text: "Total Due:", left: w - 250, top: 340, width: 100, fontSize: 12, fontFamily: "Helvetica", fill: "#64748b", fontWeight: "bold", textAlign: "right" },
        { type: "Textbox", text: "{{total}}", left: w - 150, top: 340, width: 100, fontSize: 16, fontFamily: "Helvetica", fill: "#0f172a", fontWeight: "bold", textAlign: "right" },
      ],
    },
  }),
});

register({
  id: "receipt",
  label: "Receipt",
  mergeTags: ["{{store_name}}", "{{receipt_date}}", "{{items}}", "{{subtotal}}", "{{tax}}", "{{total}}"],
  designInstructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Compact, functional receipt layout with clear itemization
- Monospace-style headers for alignment consistency
- Line separators between item rows and totals section
- Light background shading for alternating row readability
- Use placeholder merge tags: {{store_name}}, {{receipt_date}}, {{items}}, {{subtotal}}, {{tax}}, {{total}}`,
  exampleFactory: (w, h, ps) => ({
    name: "Store Receipt",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#ffffff",
      objects: [
        { type: "Textbox", text: "{{store_name}}", left: cx(w, 300), top: 40, width: 300, fontSize: 22, fontFamily: "Helvetica", fill: "#1e293b", fontWeight: "bold", textAlign: "center" },
        { type: "Textbox", text: "{{receipt_date}}", left: cx(w, 200), top: 75, width: 200, fontSize: 11, fontFamily: "Helvetica", fill: "#64748b", textAlign: "center" },
        { type: "Line", left: 40, top: 100, x1: 0, y1: 0, x2: w - 80, y2: 0, stroke: "#e2e8f0", strokeWidth: 1 },
        { type: "Textbox", text: "{{items}}", left: 40, top: 120, width: w - 80, fontSize: 12, fontFamily: "Courier New", fill: "#334155", lineHeight: 1.6 },
        { type: "Line", left: 40, top: 250, x1: 0, y1: 0, x2: w - 80, y2: 0, stroke: "#e2e8f0", strokeWidth: 1 },
        { type: "Textbox", text: "Subtotal: {{subtotal}}", left: w - 250, top: 270, width: 200, fontSize: 12, fontFamily: "Helvetica", fill: "#475569", textAlign: "right" },
        { type: "Textbox", text: "Tax: {{tax}}", left: w - 250, top: 295, width: 200, fontSize: 12, fontFamily: "Helvetica", fill: "#475569", textAlign: "right" },
        { type: "Line", left: w - 250, top: 320, x1: 0, y1: 0, x2: 200, y2: 0, stroke: "#333333", strokeWidth: 1 },
        { type: "Textbox", text: "TOTAL: {{total}}", left: w - 250, top: 335, width: 200, fontSize: 16, fontFamily: "Helvetica", fill: "#0f172a", fontWeight: "bold", textAlign: "right" },
      ],
    },
  }),
});

register({
  id: "resume",
  label: "Resume",
  mergeTags: ["{{name}}", "{{job_title}}", "{{email}}", "{{phone}}", "{{company_name}}", "{{job_role}}", "{{work_duration}}"],
  designInstructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Modern multi-column layout (a sidebar Rect for contact/skills, and a main area for content)
- Clear typographical hierarchy with bold headings and muted body text
- Fine horizontal separator Lines below section titles
- Bullet points (•) for professional listing
- Use placeholder merge tags: {{name}}, {{job_title}}, {{email}}, {{phone}}, {{company_name}}, {{job_role}}, {{work_duration}}`,
  exampleFactory: (w, h, ps) => ({
    name: "Professional Resume",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#ffffff",
      objects: [
        { type: "Rect", left: 0, top: 0, width: 240, height: h, fill: "#f8fafc" },
        { type: "Textbox", text: "{{name}}", left: 270, top: 50, width: 500, fontSize: 32, fontFamily: "Helvetica", fill: "#0f172a", fontWeight: "bold" },
        { type: "Textbox", text: "{{job_title}}", left: 270, top: 95, width: 500, fontSize: 16, fontFamily: "Helvetica", fill: "#6366f1", fontWeight: "bold" },
        { type: "Textbox", text: "CONTACT", left: 40, top: 80, width: 160, fontSize: 12, fontFamily: "Helvetica", fill: "#64748b", fontWeight: "bold", charSpacing: 100 },
        { type: "Line", left: 40, top: 100, x1: 0, y1: 0, x2: 160, y2: 0, stroke: "#cbd5e1", strokeWidth: 1 },
        { type: "Textbox", text: "Email:\n{{email}}\n\nPhone:\n{{phone}}", left: 40, top: 115, width: 160, fontSize: 10, fontFamily: "Helvetica", fill: "#334155", lineHeight: 1.5 },
        { type: "Textbox", text: "PROFESSIONAL EXPERIENCE", left: 270, top: 150, width: 500, fontSize: 14, fontFamily: "Helvetica", fill: "#1e293b", fontWeight: "bold", charSpacing: 100 },
        { type: "Line", left: 270, top: 170, x1: 0, y1: 0, x2: w - 320, y2: 0, stroke: "#cbd5e1", strokeWidth: 1 },
        { type: "Textbox", text: "{{company_name}} — {{job_role}}\n{{work_duration}}", left: 270, top: 185, width: 500, fontSize: 12, fontFamily: "Helvetica", fill: "#0f172a", fontWeight: "bold" },
        { type: "Textbox", text: "• Managed core components and led frontend feature migrations.\n• Collaborated with design teams to structure unified assets.", left: 270, top: 215, width: 500, fontSize: 11, fontFamily: "Helvetica", fill: "#475569", lineHeight: 1.6 },
      ],
    },
  }),
});

register({
  id: "email",
  label: "Email Template",
  mergeTags: ["{{recipient}}", "{{body_text}}"],
  designInstructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Centered container/card design using a large white Rect background on a light gray canvas background
- A distinct colorful header banner (Rect) for email title
- Call-to-action button (overlapping Rect + Textbox) styled with high-contrast background
- Light divider lines and footer info at the bottom
- Use placeholder merge tags: {{recipient}}, {{body_text}}`,
  exampleFactory: (w, h, ps) => ({
    name: "Email Newsletter",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#f8fafc",
      objects: [
        { type: "Rect", left: cx(w, 600), top: 40, width: 600, height: h - 80, fill: "#ffffff", rx: 8, ry: 8 },
        { type: "Rect", left: cx(w, 600), top: 40, width: 600, height: 120, fill: "#6366f1", rx: 8, ry: 8 },
        { type: "Textbox", text: "WEEKLY NEWSLETTER", left: cx(w, 560), top: 85, width: 560, fontSize: 24, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
        { type: "Textbox", text: "Hello {{recipient}},", left: cx(w, 520), top: 190, width: 520, fontSize: 16, fontFamily: "Helvetica", fill: "#1e293b", fontWeight: "bold" },
        { type: "Textbox", text: "{{body_text}}", left: cx(w, 520), top: 230, width: 520, fontSize: 13, fontFamily: "Helvetica", fill: "#475569", lineHeight: 1.6 },
        { type: "Rect", left: cx(w, 200), top: h - 180, width: 200, height: 45, fill: "#6366f1", rx: 6, ry: 6 },
        { type: "Textbox", text: "Read Full Article", left: cx(w, 200), top: h - 167, width: 200, fontSize: 13, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
        { type: "Line", left: cx(w, 520), top: h - 100, x1: 0, y1: 0, x2: 520, y2: 0, stroke: "#e2e8f0", strokeWidth: 1 },
        { type: "Textbox", text: "© 2026 Nexrover Inc. All rights reserved.\nYou are receiving this email because you subscribed to our list.", left: cx(w, 520), top: h - 85, width: 520, fontSize: 10, fontFamily: "Helvetica", fill: "#94a3b8", textAlign: "center", lineHeight: 1.4 },
      ],
    },
  }),
});

register({
  id: "ecommerce",
  label: "E-Commerce Product",
  mergeTags: ["{{product_name}}", "{{price}}", "{{description}}", "{{brand}}"],
  designInstructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Product showcase layout with clear image placeholder area
- Bold product name with price prominently displayed
- Clean badge/tag element for promotions or categories
- Professional spacing with clear visual hierarchy
- Use placeholder merge tags: {{product_name}}, {{price}}, {{description}}, {{brand}}`,
  exampleFactory: (w, h, ps) => ({
    name: "Product Showcase Card",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#f8fafc",
      objects: [
        { type: "Rect", left: 20, top: 20, width: w - 40, height: h - 40, fill: "#ffffff", rx: 12, ry: 12 },
        { type: "Rect", left: 40, top: 40, width: w - 80, height: Math.round((h - 120) * 0.5), fill: "#e2e8f0", rx: 8, ry: 8 },
        { type: "Textbox", text: "PRODUCT IMAGE", left: cx(w, 200), top: Math.round((h - 120) * 0.25), width: 200, fontSize: 14, fontFamily: "Helvetica", fill: "#94a3b8", textAlign: "center" },
        { type: "Textbox", text: "{{product_name}}", left: 40, top: Math.round((h - 120) * 0.55) + 55, width: w - 80, fontSize: 22, fontFamily: "Helvetica", fill: "#0f172a", fontWeight: "bold" },
        { type: "Textbox", text: "{{price}}", left: 40, top: Math.round((h - 120) * 0.55) + 90, width: 200, fontSize: 28, fontFamily: "Helvetica", fill: "#6366f1", fontWeight: "bold" },
        { type: "Textbox", text: "{{description}}", left: 40, top: Math.round((h - 120) * 0.55) + 130, width: w - 80, fontSize: 12, fontFamily: "Helvetica", fill: "#64748b", lineHeight: 1.5 },
        { type: "Rect", left: 40, top: h - 80, width: w - 80, height: 40, fill: "#6366f1", rx: 6, ry: 6 },
        { type: "Textbox", text: "Add to Cart", left: 40, top: h - 72, width: w - 80, fontSize: 14, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
      ],
    },
  }),
});

register({
  id: "social-media",
  label: "Social Media Post",
  mergeTags: ["{{headline}}", "{{subtext}}", "{{cta}}", "{{handle}}"],
  designInstructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Bold, attention-grabbing layout optimized for square or story formats
- Strong typographic hierarchy with oversized headline text
- Vibrant accent colors and geometric shapes for visual impact
- Clear call-to-action element with contrasting background
- Use placeholder merge tags: {{headline}}, {{subtext}}, {{cta}}, {{handle}}`,
  exampleFactory: (w, h, ps) => ({
    name: "Social Media Post",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#0f172a",
      objects: [
        { type: "Circle", left: w - 100, top: -80, radius: 180, fill: "#6366f1", opacity: 0.2 },
        { type: "Circle", left: -60, top: h - 120, radius: 140, fill: "#ec4899", opacity: 0.2 },
        { type: "Textbox", text: "{{headline}}", left: 40, top: Math.round(h * 0.3), width: w - 80, fontSize: 48, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
        { type: "Textbox", text: "{{subtext}}", left: 40, top: Math.round(h * 0.3) + 70, width: w - 80, fontSize: 16, fontFamily: "Helvetica", fill: "#cbd5e1", textAlign: "center", lineHeight: 1.5 },
        { type: "Rect", left: cx(w, 200), top: Math.round(h * 0.65), width: 200, height: 50, fill: "#6366f1", rx: 25, ry: 25 },
        { type: "Textbox", text: "{{cta}}", left: cx(w, 200), top: Math.round(h * 0.65) + 12, width: 200, fontSize: 16, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
        { type: "Textbox", text: "{{handle}}", left: 40, top: h - 60, width: w - 80, fontSize: 12, fontFamily: "Helvetica", fill: "#64748b", textAlign: "center" },
      ],
    },
  }),
});

register({
  id: "christmas-card",
  label: "Christmas Card",
  mergeTags: ["{{recipient}}", "{{sender}}", "{{message}}"],
  designInstructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Festive holiday theme with red, green, and gold accent colors
- Decorative elements (stars, trees, ornaments) using SVG shapes
- Warm, inviting typography with elegant script or serif fonts
- Cozy card layout with centered message area
- Use placeholder merge tags: {{recipient}}, {{sender}}, {{message}}`,
  exampleFactory: (w, h, ps) => ({
    name: "Christmas Card",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#1a472a",
      objects: [
        { type: "Circle", left: w - 80, top: 30, radius: 40, fill: "#c9a84c", opacity: 0.3 },
        { type: "Circle", left: 50, top: h - 80, radius: 30, fill: "#c9a84c", opacity: 0.2 },
        { type: "Textbox", text: "Merry Christmas", left: cx(w, 400), top: 60, width: 400, fontSize: 36, fontFamily: "Georgia", fill: "#c9a84c", fontWeight: "bold", textAlign: "center" },
        { type: "Line", left: cx(w, 300), top: 110, x1: 0, y1: 0, x2: 300, y2: 0, stroke: "#c9a84c", strokeWidth: 1 },
        { type: "Textbox", text: "Dear {{recipient}},", left: cx(w, 400), top: 140, width: 400, fontSize: 16, fontFamily: "Georgia", fill: "#ffffff", textAlign: "center" },
        { type: "Textbox", text: "{{message}}", left: cx(w, 400), top: 180, width: 400, fontSize: 14, fontFamily: "Georgia", fill: "#d4e8d0", textAlign: "center", lineHeight: 1.6 },
        { type: "Textbox", text: "With love,\n{{sender}}", left: cx(w, 300), top: h - 120, width: 300, fontSize: 14, fontFamily: "Georgia", fill: "#ffffff", textAlign: "center", lineHeight: 1.5 },
      ],
    },
  }),
});

register({
  id: "real-estate",
  label: "Real Estate",
  mergeTags: ["{{property_title}}", "{{price}}", "{{address}}", "{{bedrooms}}", "{{bathrooms}}", "{{sqft}}"],
  designInstructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Premium property listing layout with prominent image area
- Clean price badge with high-contrast background
- Property details grid with icons or labels for beds/baths/sqft
- Elegant typography conveying luxury and professionalism
- Use placeholder merge tags: {{property_title}}, {{price}}, {{address}}, {{bedrooms}}, {{bathrooms}}, {{sqft}}`,
  exampleFactory: (w, h, ps) => ({
    name: "Real Estate Listing",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#ffffff",
      objects: [
        { type: "Rect", left: 0, top: 0, width: w, height: Math.round(h * 0.55), fill: "#e2e8f0" },
        { type: "Textbox", text: "PROPERTY IMAGE", left: cx(w, 200), top: Math.round(h * 0.25), width: 200, fontSize: 14, fontFamily: "Helvetica", fill: "#94a3b8", textAlign: "center" },
        { type: "Rect", left: 30, top: Math.round(h * 0.55) + 20, width: 120, height: 36, fill: "#0f172a", rx: 6, ry: 6 },
        { type: "Textbox", text: "{{price}}", left: 30, top: Math.round(h * 0.55) + 27, width: 120, fontSize: 14, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
        { type: "Textbox", text: "{{property_title}}", left: 30, top: Math.round(h * 0.55) + 70, width: w - 60, fontSize: 20, fontFamily: "Helvetica", fill: "#0f172a", fontWeight: "bold" },
        { type: "Textbox", text: "{{address}}", left: 30, top: Math.round(h * 0.55) + 100, width: w - 60, fontSize: 12, fontFamily: "Helvetica", fill: "#64748b" },
        { type: "Line", left: 30, top: Math.round(h * 0.55) + 130, x1: 0, y1: 0, x2: w - 60, y2: 0, stroke: "#e2e8f0", strokeWidth: 1 },
        { type: "Textbox", text: "{{bedrooms}} Beds  |  {{bathrooms}} Baths  |  {{sqft}} sqft", left: 30, top: Math.round(h * 0.55) + 145, width: w - 60, fontSize: 13, fontFamily: "Helvetica", fill: "#334155", textAlign: "center" },
      ],
    },
  }),
});

register({
  id: "shipping-label",
  label: "Shipping Label",
  mergeTags: ["{{sender_name}}", "{{sender_address}}", "{{receiver_name}}", "{{receiver_address}}", "{{tracking_id}}"],
  designInstructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Functional, scannable shipping label layout
- Clear separation between sender and receiver sections
- Bold tracking ID with barcode-style visual treatment
- High contrast for readability and scanning
- Use placeholder merge tags: {{sender_name}}, {{sender_address}}, {{receiver_name}}, {{receiver_address}}, {{tracking_id}}`,
  exampleFactory: (w, h, ps) => ({
    name: "Shipping Label",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#ffffff",
      objects: [
        { type: "Rect", left: 15, top: 15, width: w - 30, height: h - 30, fill: "transparent", stroke: "#333333", strokeWidth: 2, rx: 4, ry: 4 },
        { type: "Textbox", text: "FROM:", left: 30, top: 30, width: 100, fontSize: 10, fontFamily: "Helvetica", fill: "#64748b", fontWeight: "bold", charSpacing: 100 },
        { type: "Textbox", text: "{{sender_name}}\n{{sender_address}}", left: 30, top: 50, width: w / 2 - 50, fontSize: 12, fontFamily: "Helvetica", fill: "#1e293b", lineHeight: 1.4 },
        { type: "Textbox", text: "TO:", left: w / 2 + 20, top: 30, width: 100, fontSize: 10, fontFamily: "Helvetica", fill: "#64748b", fontWeight: "bold", charSpacing: 100 },
        { type: "Textbox", text: "{{receiver_name}}\n{{receiver_address}}", left: w / 2 + 20, top: 50, width: w / 2 - 50, fontSize: 12, fontFamily: "Helvetica", fill: "#1e293b", lineHeight: 1.4 },
        { type: "Line", left: 30, top: Math.round(h * 0.4), x1: 0, y1: 0, x2: w - 60, y2: 0, stroke: "#333333", strokeWidth: 1 },
        { type: "Textbox", text: "TRACKING", left: cx(w, 150), top: Math.round(h * 0.42), width: 150, fontSize: 10, fontFamily: "Helvetica", fill: "#64748b", fontWeight: "bold", textAlign: "center", charSpacing: 200 },
        { type: "Textbox", text: "{{tracking_id}}", left: cx(w, 300), top: Math.round(h * 0.48), width: 300, fontSize: 22, fontFamily: "Courier New", fill: "#0f172a", fontWeight: "bold", textAlign: "center" },
      ],
    },
  }),
});

register({
  id: "open-graph",
  label: "Open Graph Image",
  mergeTags: ["{{title}}", "{{description}}", "{{site_name}}"],
  designInstructions: `DESIGN EXCELLENCE REQUIREMENTS:
- Optimized for social sharing (1200×630px standard)
- Bold, readable title text that works at small preview sizes
- Clean layout with strong visual hierarchy
- Brand-consistent color usage
- Use placeholder merge tags: {{title}}, {{description}}, {{site_name}}`,
  exampleFactory: (w, h, ps) => ({
    name: "Open Graph Image",
    width: w,
    height: h,
    paperSize: ps,
    canvasJson: {
      version: "7.0.0",
      background: "#0f172a",
      objects: [
        { type: "Rect", left: 0, top: 0, width: w, height: h, fill: "#0f172a" },
        { type: "Rect", left: 40, top: 40, width: w - 80, height: h - 80, fill: "transparent", stroke: "#6366f1", strokeWidth: 2, rx: 12, ry: 12 },
        { type: "Textbox", text: "{{title}}", left: 60, top: Math.round(h * 0.25), width: w - 120, fontSize: 36, fontFamily: "Helvetica", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
        { type: "Textbox", text: "{{description}}", left: 60, top: Math.round(h * 0.55), width: w - 120, fontSize: 16, fontFamily: "Helvetica", fill: "#94a3b8", textAlign: "center", lineHeight: 1.5 },
        { type: "Textbox", text: "{{site_name}}", left: 60, top: h - 80, width: w - 120, fontSize: 12, fontFamily: "Helvetica", fill: "#6366f1", fontWeight: "bold", textAlign: "center" },
      ],
    },
  }),
});

/* ── Public API ─────────────────────────────────────────── */

/** Look up a registered skill set by ID. Falls back to "certificate" if unknown. */
export function getSkillSet(id: string): SkillSetEntry {
  const normalized = id.toLowerCase().trim();
  return registry.get(normalized) ?? registry.get("certificate")!;
}

/** Get all registered skill set IDs and labels. */
export function listSkillSets(): { id: string; label: string }[] {
  return Array.from(registry.values()).map(({ id, label }) => ({ id, label }));
}

/** Register a custom skill set at runtime (extensibility hook). */
export { register as registerSkillSet };
