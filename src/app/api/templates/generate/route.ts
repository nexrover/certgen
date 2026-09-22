import { NextResponse } from "next/server";
import { PAPER_DIMENSIONS, type PaperSize, type BrandKit, type BrandKitLayout } from "@/lib/types";
import { compilePrompt, type PromptCompilationInput, type InjectedAsset } from "@/lib/services/prompt-engine";
import { injectAssetsIntoCanvas } from "@/lib/services/prompt-engine/asset-post-processor";

/* ── Allowed properties per Fabric.js type ─────────────── */
const TEXTBOX_KEYS = new Set([
  "type", "text", "left", "top", "width", "fontSize", "fontFamily",
  "fill", "fontWeight", "fontStyle", "textAlign", "charSpacing",
  "lineHeight", "selectable", "originX", "originY", "opacity",
  "underline", "linethrough", "overline", "angle", "name",
]);

const RECT_KEYS = new Set([
  "type", "left", "top", "width", "height", "fill", "stroke",
  "strokeWidth", "rx", "ry", "selectable", "originX", "originY",
  "opacity", "angle", "name",
]);

const LINE_KEYS = new Set([
  "type", "left", "top", "x1", "y1", "x2", "y2", "stroke",
  "strokeWidth", "selectable", "originX", "originY", "opacity", "angle", "name",
]);

const CIRCLE_KEYS = new Set([
  "type", "left", "top", "radius", "fill", "stroke", "strokeWidth",
  "selectable", "originX", "originY", "opacity", "angle", "name",
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

/* ── Compact prompt for smaller Groq models ─────────── */
function buildCompactSystemInstruction(compiled: {
  systemInstruction: string;
  temperature: number;
}): string {
  // Keep only essential sections: identity, skill set, canvas, schema rules, user prompt
  const sections = compiled.systemInstruction.split("/* ── ");
  const essential = ["CORE_IDENTITY", "SYSTEM_SKILL_SET", "TARGET_CANVAS", "SCHEMA_RULES", "USER_INSTRUCTIONS"];
  const kept: string[] = [];

  for (const section of sections) {
    const headerEnd = section.indexOf(" ─");
    if (headerEnd === -1) continue;
    const header = section.substring(0, headerEnd).trim();
    if (essential.some((e) => header.startsWith(e))) {
      kept.push("/* ── " + section);
    }
  }

  const condensed = kept.join("\n\n");
  // Hard cap at ~3000 chars to stay well within TPM limits
  return condensed.length > 3000 ? condensed.substring(0, 3000) + "\n\nReturn ONLY valid JSON." : condensed;
}

function detectCategoryFromPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("certificate") || lower.includes("award") || lower.includes("diploma") || lower.includes("credential")) {
    return "certificate";
  }
  if (lower.includes("youtube") || lower.includes("thumbnail") || lower.includes("ctr") || lower.includes("video")) {
    return "youtube";
  }
  if (lower.includes("invoice") || lower.includes("bill") || lower.includes("billing") || lower.includes("charge")) {
    return "invoice";
  }
  if (lower.includes("receipt") || lower.includes("transaction") || lower.includes("purchase")) {
    return "receipt";
  }
  if (lower.includes("resume") || lower.includes("cv") || lower.includes("job application")) {
    return "resume";
  }
  if (lower.includes("email") || lower.includes("newsletter")) {
    return "email";
  }
  if (lower.includes("product") || lower.includes("store") || lower.includes("ecommerce") || lower.includes("shop")) {
    return "ecommerce";
  }
  if (lower.includes("social") || lower.includes("post") || lower.includes("instagram") || lower.includes("facebook") || lower.includes("twitter") || lower.includes("linkedin")) {
    return "social-media";
  }
  if (lower.includes("christmas") || lower.includes("holiday") || lower.includes("festive") || lower.includes("greetings")) {
    return "christmas-card";
  }
  if (lower.includes("house") || lower.includes("property") || lower.includes("real estate") || lower.includes("home")) {
    return "real-estate";
  }
  if (lower.includes("shipping") || lower.includes("package") || lower.includes("label")) {
    return "shipping-label";
  }
  if (lower.includes("open graph") || lower.includes("og") || lower.includes("seo")) {
    return "open-graph";
  }

  // Pick a random category from all supported ones
  const categories = [
    "certificate",
    "youtube",
    "invoice",
    "receipt",
    "resume",
    "email",
    "ecommerce",
    "social-media",
    "christmas-card",
    "real-estate",
    "shipping-label",
    "open-graph",
  ];
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

function detectDimensionsFromPrompt(prompt: string): { width: number; height: number; paperSize: string } | null {
  const match = prompt.match(/(\d+)\s*(?:px|pixel|pixels)?\s*[x×]\s*(\d+)\s*(?:px|pixel|pixels)?/i);
  if (match) {
    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);
    if (width > 0 && height > 0) {
      return { width, height, paperSize: "CUSTOM" };
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      category,
      orientation = "landscape",
      paperSize: reqPaperSize,
      style = "modern",
      brandKit: brandKitPayload,
      layout: layoutPayload,
      assets: assetsPayload,
      provider = "gemini",
      model: reqModel,
      referenceImages,
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // ── Resolve category dynamically ───────────────────────
    let resolvedCategory = category;
    if (!resolvedCategory) {
      resolvedCategory = detectCategoryFromPrompt(prompt);
      console.log(`[AI Generate] Category resolved dynamically: ${resolvedCategory}`);
    }

    // ── Resolve provider & API key ─────────────────────────
    const isGroq = provider === "groq";

    let apiKey: string | undefined;
    if (isGroq) {
      apiKey = process.env.GROQ_API_KEY?.trim().replace(/;+$/, "");
      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: "Groq API key is not configured" },
          { status: 500 }
        );
      }
    } else {
      apiKey = process.env.GEMINI_API_KEY?.trim().replace(/;+$/, "");
      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: "Gemini API key is not configured" },
          { status: 500 }
        );
      }
    }

    // ── Determine canvas dimensions ──────────────────────
    let width = 842;
    let height = 595;
    let paperSize = "A4_LANDSCAPE";

    const promptDims = detectDimensionsFromPrompt(prompt);

    if (reqPaperSize && PAPER_DIMENSIONS[reqPaperSize as PaperSize]) {
      const dims = PAPER_DIMENSIONS[reqPaperSize as PaperSize];
      width = dims.width;
      height = dims.height;
      paperSize = reqPaperSize;
    } else if (promptDims) {
      width = promptDims.width;
      height = promptDims.height;
      paperSize = promptDims.paperSize;
      console.log(`[AI Generate] Canvas size resolved from prompt: ${width}x${height}`);
    } else {
      if (orientation === "square") {
        width = 1080; height = 1080; paperSize = "CUSTOM";
      } else if (resolvedCategory === "youtube") {
        if (orientation === "portrait") {
          width = 720; height = 1280; paperSize = "CUSTOM";
        } else {
          width = 1280; height = 720; paperSize = "YOUTUBE_THUMBNAIL";
        }
      } else if (resolvedCategory === "certificate") {
        if (orientation === "portrait") {
          width = 595; height = 842; paperSize = "A4";
        } else {
          width = 842; height = 595; paperSize = "A4_LANDSCAPE";
        }
      } else if (["invoice", "resume", "receipt"].includes(resolvedCategory)) {
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

    // ── Parse reference images (base64 data URLs) ────────
    let refImages: string[] = [];
    if (Array.isArray(referenceImages)) {
      refImages = referenceImages
          .filter((img: unknown): img is string =>
              typeof img === "string" && img.startsWith("data:image/")
          )
          .slice(0, 4); // max 4 reference images
    }

    // ── Compile prompt via the Prompt Engine ─────────────
    const compilationInput: PromptCompilationInput = {
      skillSet: resolvedCategory,
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
    console.log(`[AI Generate] Provider: ${provider} | Prompt condition: ${conditionLabel} | Blocks: ${compiled.meta.blockOrder.join(", ")}`);

    // ── Call AI provider ────────────────────────────────
    let candidateText = "";
    let lastErrorMsg = "";

    if (isGroq) {
      // ── Groq with fallback chain ──────────────────────
      // Large models use full prompt, small models use compact prompt
      const groqModels = [
        { id: "llama-3.3-70b-versatile", compact: false },
        { id: "llama3-70b-8192", compact: false },
        { id: "mixtral-8x7b-32768", compact: true },
        { id: "llama-3.1-8b-instant", compact: true },
        { id: "llama3-8b-8192", compact: true },
        { id: "gemma2-9b-it", compact: true },
      ];

      // If user picked a specific model, try it first
      const requestedModel = groqModels.find((m) => m.id === reqModel);
      const orderedModels = requestedModel
        ? [requestedModel, ...groqModels.filter((m) => m.id !== reqModel)]
        : groqModels;

      for (const { id: groqModel, compact } of orderedModels) {
        let systemContent = compact
          ? buildCompactSystemInstruction(compiled)
          : compiled.systemInstruction;

        const userContent = compiled.userMessage;

        // Append reference image instruction (Groq doesn't support vision)
        if (refImages.length > 0) {
          systemContent += `\n\nThe user has provided ${refImages.length} reference image(s). Since you cannot see images, use the user's text description to match the design style, layout, colors, and overall aesthetic shown in the reference. Create a template that captures the same look and feel.`;
        }

        const groqPayload = {
          model: groqModel,
          messages: [
            { role: "system", content: systemContent },
            { role: "user", content: userContent },
          ],
          temperature: compiled.temperature,
          response_format: { type: "json_object" },
        };

        const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
          console.log(`[AI Generate] Calling Groq: ${groqModel} (compact: ${compact})`);
          let response: Response | null = null;
          let retries = 2;

          while (retries >= 0) {
            response = await fetch(groqUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify(groqPayload),
              signal: controller.signal,
            });

            if (response.status !== 429 || retries === 0) break;

            console.warn(`[AI Generate] Groq ${groqModel} → 429, retrying in 2s...`);
            await new Promise((r) => setTimeout(r, 2000));
            retries--;
          }

          clearTimeout(timeoutId);

          if (response && response.ok) {
            const resultData = await response.json();
            const text = resultData.choices?.[0]?.message?.content;
            if (text) {
              candidateText = text;
              console.log(`[AI Generate] ✓ Success with Groq ${groqModel}`);
              break;
            }
          } else if (response) {
            const errBody = await response.json().catch(() => ({}));
            const errText = errBody.error?.message || response.statusText;
            console.warn(`[AI Generate] Groq ${groqModel} → ${response.status}: ${errText}`);
            lastErrorMsg = errText;

            // If "request too large", try next model (will use compact prompt)
            if (errText.includes("Request too large")) {
              console.warn(`[AI Generate] ${groqModel} prompt too large, trying next model...`);
              continue;
            }
          } else {
            lastErrorMsg = "No response from Groq";
          }
        } catch (err: unknown) {
          clearTimeout(timeoutId);
          const errMsg = err instanceof Error ? err.message : "Network Error";
          console.warn(`[AI Generate] Groq ${groqModel} network error:`, errMsg);
          lastErrorMsg = errMsg;
        }

        if (candidateText) break;
      }
    } else {
      // ── Gemini ────────────────────────────────────────
      // Build multimodal contents with optional reference images
      const userParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      // Add reference images first
      for (const dataUrl of refImages) {
        const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          userParts.push({
            inlineData: { mimeType: match[1], data: match[2] },
          });
        }
      }

      // Add the text prompt
      userParts.push({ text: compiled.userMessage });

      // If we have images, append a note to the system instruction
      let systemText = compiled.systemInstruction;
      if (refImages.length > 0) {
        systemText += `\n\nThe user has provided ${refImages.length} reference image(s). Use them as visual reference for the design style, layout, colors, and overall aesthetic. Match the look and feel of the reference while creating your own unique template.`;
      }

      const geminiPayload = {
        contents: [{ role: "user", parts: userParts }],
        systemInstruction: { parts: [{ text: systemText }] },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: compiled.temperature,
        },
      };

      console.log("[AI Generate] Gemini request body:", JSON.stringify(geminiPayload, null, 2));

      const geminiModels = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-3.5-flash",
        "gemini-3.1-pro-preview",
      ];

      const modelsToTry = reqModel
        ? [reqModel, ...geminiModels.filter((m) => m !== reqModel)]
        : geminiModels;

      for (const model of modelsToTry) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          console.log(`[AI Generate] Trying Gemini model: ${model}`);
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
            lastErrorMsg += `[${model}]: ${errText}; `;
          } else {
            lastErrorMsg += `[${model}]: No response; `;
          }
        } catch (err: unknown) {
          clearTimeout(timeoutId);
          const errMsg = err instanceof Error ? err.message : "Network Error";
          console.warn(`[AI Generate] ${model} network error:`, errMsg);
          lastErrorMsg += `[${model}]: ${errMsg}; `;
        }

        if (candidateText) break;
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
      console.log("=== PRE PROCESSOR JSON ===", JSON.stringify(parsedTemplate, null, 2));
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

    console.log("=== POST PROCESSOR JSON ===", JSON.stringify(canvasJson, null, 2));

    const finalOutput = {
      success: true,
      name: parsedTemplate.name || "AI Generated Template",
      width: parsedTemplate.width || width,
      height: parsedTemplate.height || height,
      paperSize: parsedTemplate.paperSize || paperSize,
      category: resolvedCategory,
      canvasJson,
    };

    console.log("=== FINAL OUTPUT JSON ===", JSON.stringify(finalOutput, null, 2));

    return NextResponse.json(finalOutput);
  } catch (error) {
    console.error("[AI Generate] Unexpected error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
