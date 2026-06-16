import { NextResponse } from "next/server";
import { PAPER_DIMENSIONS, type PaperSize } from "@/lib/types";

/* ── Helper: center-align horizontally ─────────────────── */
function cx(canvasW: number, objW: number) {
  return Math.round((canvasW - objW) / 2);
}

/* ── Allowed properties per Fabric.js type ─────────────── */
const TEXTBOX_KEYS = new Set([
  "type", "text", "left", "top", "width", "fontSize", "fontFamily",
  "fill", "fontWeight", "fontStyle", "textAlign", "charSpacing",
  "lineHeight", "selectable", "originX", "originY", "opacity",
  "underline", "linethrough", "overline", "angle",
]);

const RECT_KEYS = new Set([
  "type", "left", "top", "width", "height", "fill", "stroke",
  "strokeWidth", "rx", "ry", "selectable", "originX", "originY",
  "opacity", "angle",
]);

const LINE_KEYS = new Set([
  "type", "left", "top", "x1", "y1", "x2", "y2", "stroke",
  "strokeWidth", "selectable", "originX", "originY", "opacity", "angle",
]);

const CIRCLE_KEYS = new Set([
  "type", "left", "top", "radius", "fill", "stroke", "strokeWidth",
  "selectable", "originX", "originY", "opacity", "angle",
]);

function getAllowedKeys(type: string): Set<string> | null {
  switch (type) {
    case "Textbox": return TEXTBOX_KEYS;
    case "Rect": return RECT_KEYS;
    case "Line": return LINE_KEYS;
    case "Circle": return CIRCLE_KEYS;
    default: return null;
  }
}

/* ── Type normalization map ────────────────────────────── */
const TYPE_MAP: Record<string, string> = {
  textbox: "Textbox", text: "Textbox",
  rect: "Rect", rectangle: "Rect",
  line: "Line",
  circle: "Circle",
  ellipse: "Ellipse",
  triangle: "Triangle",
  path: "Path",
  polygon: "Polygon",
  polyline: "Polyline",
  group: "Group",
  image: "image",
};

export async function POST(req: Request) {
  try {
    const { prompt, category = "certificate", orientation = "landscape", paperSize: reqPaperSize, style = "modern" } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }
    apiKey = apiKey.trim().replace(/;+$/, "");

    // ── Determine canvas dimensions ──────────────────────
    let width = 842;
    let height = 595;
    let paperSize = "A4_LANDSCAPE";

    if (reqPaperSize && PAPER_DIMENSIONS[reqPaperSize as PaperSize]) {
      const dims = PAPER_DIMENSIONS[reqPaperSize as PaperSize];
      width = dims.width;
      height = dims.height;
      paperSize = reqPaperSize;
    } else {
      if (orientation === "square") {
        width = 1080; height = 1080; paperSize = "CUSTOM";
      } else if (category === "youtube") {
        if (orientation === "portrait") {
          width = 720; height = 1280; paperSize = "CUSTOM";
        } else {
          width = 1280; height = 720; paperSize = "YOUTUBE_THUMBNAIL";
        }
      } else if (category === "certificate") {
        if (orientation === "portrait") {
          width = 595; height = 842; paperSize = "A4";
        } else {
          width = 842; height = 595; paperSize = "A4_LANDSCAPE";
        }
      } else if (["invoice", "resume", "receipt"].includes(category)) {
        width = 1020; height = 1320; paperSize = "INVOICE";
      } else {
        if (orientation === "portrait") {
          width = 595; height = 842; paperSize = "A4";
        } else {
          width = 842; height = 595; paperSize = "A4_LANDSCAPE";
        }
      }
    }

    // ── Build a concrete example template for the AI ─────
    const exampleTemplate = {
      name: "Course Completion Certificate",
      width, height, paperSize,
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

    // ── System prompt ────────────────────────────────────
    const systemPrompt = `You are a world-class graphic designer specializing in Fabric.js v7 canvas templates.
You MUST return ONLY valid JSON. No markdown, no code fences, no explanation.

TARGET CANVAS:
- Width: ${width}px, Height: ${height}px
- Paper Size: ${paperSize}
- Style: ${style}

CRITICAL RULES:
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
7. Use the centering formula: left = (${width} - elementWidth) / 2

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

    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Design a stunning ${category} template: "${prompt}". Use ${orientation} orientation (${width}×${height}px) with ${style} style. Return ONLY valid JSON matching the required schema.`,
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    };

    // ── Call Gemini with fallback models ──────────────────
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-flash-latest",
    ];

    let candidateText = "";
    let lastErrorMsg = "";

    for (const model of modelsToTry) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        console.log(`[AI Generate] Trying model: ${model}`);
        let response: Response | null = null;
        let retries = 2;

        while (retries >= 0) {
          response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(geminiPayload),
            signal: controller.signal,
          });

          if (response.status !== 503 || retries === 0) break;

          console.warn(`[AI Generate] ${model} → 503, retrying in 1s...`);
          await new Promise((r) => setTimeout(r, 1000));
          retries--;
        }

        clearTimeout(timeoutId);

        if (response && response.ok) {
          const resultData = await response.json();
          const text = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            candidateText = text;
            console.log(`[AI Generate] ✓ Success with ${model}`);
            break;
          }
        } else if (response) {
          const errBody = await response.json().catch(() => ({}));
          const errText = errBody.error?.message || response.statusText;
          console.warn(`[AI Generate] ${model} → ${response.status}: ${errText}`);
          lastErrorMsg = errText;
        } else {
          lastErrorMsg = "No response received";
        }
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const errMsg = err instanceof Error ? err.message : "Network Error";
        console.warn(`[AI Generate] ${model} network error:`, errMsg);
        lastErrorMsg = errMsg;
      }
    }

    if (!candidateText) {
      return NextResponse.json(
        { success: false, error: `AI generation failed: ${lastErrorMsg}` },
        { status: 502 }
      );
    }

    // ── Parse and sanitize ───────────────────────────────
    let parsedTemplate: Record<string, unknown>;
    try {
      // Strip markdown code fences if the AI wrapped the JSON
      let cleaned = candidateText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      parsedTemplate = JSON.parse(cleaned);
    } catch {
      console.error("[AI Generate] Failed to parse JSON:", candidateText.slice(0, 500));
      return NextResponse.json(
        { success: false, error: "AI returned invalid JSON. Please try again." },
        { status: 502 }
      );
    }

    // Ensure canvasJson exists
    const canvasJson = parsedTemplate.canvasJson as Record<string, unknown> | undefined;
    if (!canvasJson || !Array.isArray(canvasJson.objects)) {
      return NextResponse.json(
        { success: false, error: "AI returned incomplete template data. Please try again." },
        { status: 502 }
      );
    }

    // Sanitize each object: normalize type, strip invalid properties, set defaults
    canvasJson.objects = (canvasJson.objects as Record<string, unknown>[]).map((obj) => {
      // Normalize type
      if (typeof obj.type === "string") {
        const lower = obj.type.toLowerCase();
        if (TYPE_MAP[lower]) {
          obj.type = TYPE_MAP[lower];
        }
      }

      const objType = obj.type as string;
      const allowedKeys = getAllowedKeys(objType);

      if (allowedKeys) {
        // Strip any properties that don't belong to this type
        for (const key of Object.keys(obj)) {
          if (!allowedKeys.has(key)) {
            delete obj[key];
          }
        }
      }

      // Set defaults
      obj.selectable = true;
      obj.originX = "left";
      obj.originY = "top";

      // Fix Textbox specifics
      if (objType === "Textbox") {
        if (!obj.text || typeof obj.text !== "string") obj.text = "Text";
        if (!obj.width || (obj.width as number) < 50) obj.width = 200;
        if (!obj.fontSize) obj.fontSize = 16;
        if (!obj.fontFamily) obj.fontFamily = "Georgia";
        if (!obj.fill) obj.fill = "#333333";
        // Clamp charSpacing
        if (typeof obj.charSpacing === "number" && (obj.charSpacing as number) > 800) {
          obj.charSpacing = 800;
        }
      }

      // Fix Rect specifics
      if (objType === "Rect") {
        if (!obj.width) obj.width = 100;
        if (!obj.height) obj.height = 100;
        if (!obj.fill && !obj.stroke) obj.fill = "#cccccc";
      }

      // Fix Line specifics
      if (objType === "Line") {
        if (obj.x2 === undefined) obj.x2 = 200;
        if (obj.y2 === undefined) obj.y2 = 0;
        if (obj.x1 === undefined) obj.x1 = 0;
        if (obj.y1 === undefined) obj.y1 = 0;
        if (!obj.stroke) obj.stroke = "#333333";
        if (!obj.strokeWidth) obj.strokeWidth = 1;
      }

      // Fix Circle specifics
      if (objType === "Circle") {
        if (!obj.radius) obj.radius = 30;
        if (!obj.fill) obj.fill = "#cccccc";
      }

      // Ensure position defaults
      if (typeof obj.left !== "number") obj.left = 50;
      if (typeof obj.top !== "number") obj.top = 50;

      return obj;
    });

    // Ensure version and background
    if (!canvasJson.version) canvasJson.version = "7.0.0";
    if (!canvasJson.background) canvasJson.background = "#ffffff";

    return NextResponse.json({
      success: true,
      name: parsedTemplate.name || "AI Generated Template",
      width: parsedTemplate.width || width,
      height: parsedTemplate.height || height,
      paperSize: parsedTemplate.paperSize || paperSize,
      canvasJson,
    });
  } catch (error) {
    console.error("[AI Generate] Unexpected error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
