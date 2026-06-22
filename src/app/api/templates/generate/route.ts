import { NextResponse } from "next/server";
import { PAPER_DIMENSIONS, type PaperSize, type BrandKit, type BrandKitLayout } from "@/lib/types";
import { compilePrompt, type PromptCompilationInput, type InjectedAsset } from "@/lib/services/prompt-engine";
import { injectAssetsIntoCanvas } from "@/lib/services/prompt-engine/asset-post-processor";

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

const IMAGE_KEYS = new Set([
  "type", "src", "crossOrigin", "left", "top", "width", "height",
  "scaleX", "scaleY", "fill", "opacity", "angle", "name",
  "selectable", "originX", "originY", "flipX", "flipY", "skewX", "skewY",
]);

function getAllowedKeys(type: string): Set<string> | null {
  switch (type) {
    case "Textbox": return TEXTBOX_KEYS;
    case "Rect": return RECT_KEYS;
    case "Line": return LINE_KEYS;
    case "Circle": return CIRCLE_KEYS;
    case "image": return IMAGE_KEYS;
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
    const body = await req.json();
    const {
      prompt,
      category = "certificate",
      orientation = "landscape",
      paperSize: reqPaperSize,
      style = "modern",
      brandKit: brandKitPayload,
      layout: layoutPayload,
      assets: assetsPayload,
    } = body;

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

    // ── Parse brand kit ──────────────────────────────────
    const hasBrandKit =
      brandKitPayload &&
      typeof brandKitPayload === "object" &&
      typeof brandKitPayload.name === "string";
    const brandKit = hasBrandKit ? (brandKitPayload as BrandKit) : null;

    // ── Parse layout ─────────────────────────────────────
    const hasLayout =
      layoutPayload &&
      typeof layoutPayload === "object" &&
      typeof layoutPayload.id === "string" &&
      typeof layoutPayload.name === "string";
    const layout = hasLayout ? (layoutPayload as BrandKitLayout) : null;

    // ── Parse assets ─────────────────────────────────────
    let assets: InjectedAsset[] = [];
    if (Array.isArray(assetsPayload)) {
      assets = assetsPayload
        .filter((a: unknown): a is InjectedAsset =>
          typeof a === "object" &&
          a !== null &&
          "kind" in a &&
          "url" in a &&
          "label" in a
        );
    }

    // ── Compile prompt via the Prompt Engine ─────────────
    const compilationInput: PromptCompilationInput = {
      skillSet: category,
      width,
      height,
      paperSize,
      style,
      brandKit,
      layout,
      assets,
      userPrompt: prompt,
    };

    const compiled = compilePrompt(compilationInput);

    const conditionLabel = brandKit ? "A (Brand Kit)" : layout ? "A' (Layout)" : "B (Default)";
    console.log(`[AI Generate] Prompt condition: ${conditionLabel} | Blocks: ${compiled.meta.blockOrder.join(", ")}`);

    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: compiled.userMessage,
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [{ text: compiled.systemInstruction }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: compiled.temperature,
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

    const canvasJson = parsedTemplate.canvasJson as Record<string, unknown> | undefined;
    if (!canvasJson || !Array.isArray(canvasJson.objects)) {
      return NextResponse.json(
        { success: false, error: "AI returned incomplete template data. Please try again." },
        { status: 502 }
      );
    }

    // Sanitize each object
    canvasJson.objects = (canvasJson.objects as Record<string, unknown>[]).map((obj) => {
      if (typeof obj.type === "string") {
        const lower = obj.type.toLowerCase();
        if (TYPE_MAP[lower]) {
          obj.type = TYPE_MAP[lower];
        }
      }

      const objType = obj.type as string;
      const allowedKeys = getAllowedKeys(objType);

      if (allowedKeys) {
        for (const key of Object.keys(obj)) {
          if (!allowedKeys.has(key)) {
            delete obj[key];
          }
        }
      }

      obj.selectable = true;
      obj.originX = "left";
      obj.originY = "top";

      if (objType === "Textbox") {
        if (!obj.text || typeof obj.text !== "string") obj.text = "Text";
        if (!obj.width || (obj.width as number) < 50) obj.width = 200;
        if (!obj.fontSize) obj.fontSize = 16;
        if (!obj.fontFamily) obj.fontFamily = "Georgia";
        if (!obj.fill) obj.fill = "#333333";
        if (typeof obj.charSpacing === "number" && (obj.charSpacing as number) > 800) {
          obj.charSpacing = 800;
        }
      }

      if (objType === "Rect") {
        if (!obj.width) obj.width = 100;
        if (!obj.height) obj.height = 100;
        if (!obj.fill && !obj.stroke) obj.fill = "#cccccc";
      }

      if (objType === "Line") {
        if (obj.x2 === undefined) obj.x2 = 200;
        if (obj.y2 === undefined) obj.y2 = 0;
        if (obj.x1 === undefined) obj.x1 = 0;
        if (obj.y1 === undefined) obj.y1 = 0;
        if (!obj.stroke) obj.stroke = "#333333";
        if (!obj.strokeWidth) obj.strokeWidth = 1;
      }

      if (objType === "Circle") {
        if (!obj.radius) obj.radius = 30;
        if (!obj.fill) obj.fill = "#cccccc";
      }

      if (objType === "image") {
        if (!obj.src || typeof obj.src !== "string") obj.src = "";
        if (!obj.crossOrigin) obj.crossOrigin = "anonymous";
        if (!obj.width) obj.width = 200;
        if (!obj.height) obj.height = 150;
        if (typeof obj.scaleX !== "number") obj.scaleX = 1;
        if (typeof obj.scaleY !== "number") obj.scaleY = 1;
      }

      if (typeof obj.left !== "number") obj.left = 50;
      if (typeof obj.top !== "number") obj.top = 50;

      return obj;
    });

    if (!canvasJson.version) canvasJson.version = "7.0.0";
    if (!canvasJson.background) canvasJson.background = "#ffffff";

    // ── Post-process: inject actual asset images ──────────
    if (assets.length > 0) {
      const injected = injectAssetsIntoCanvas(canvasJson, assets);
      if (injected > 0) {
        console.log(`[AI Generate] Injected ${injected} asset image(s) into canvas`);
      }
    }

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
