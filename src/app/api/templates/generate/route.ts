import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request payload
    const { prompt, category = "certificate", orientation = "landscape", style = "modern" } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Gemini API key is not configured in .env.local" },
        { status: 500 }
      );
    }

    // 3. Determine dimensions based on category and orientation
    let width = 842;
    let height = 595;
    let paperSize = "A4_LANDSCAPE";

    if (orientation === "square") {
      width = 1080;
      height = 1080;
      paperSize = "CUSTOM";
    } else if (category === "youtube") {
      if (orientation === "portrait") {
        width = 720;
        height = 1280;
        paperSize = "CUSTOM";
      } else {
        width = 1280;
        height = 720;
        paperSize = "YOUTUBE_THUMBNAIL";
      }
    } else if (category === "certificate") {
      if (orientation === "portrait") {
        width = 595;
        height = 842;
        paperSize = "A4";
      } else {
        width = 842;
        height = 595;
        paperSize = "A4_LANDSCAPE";
      }
    } else if (["invoice", "resume", "receipt"].includes(category)) {
      width = 1020;
      height = 1320;
      paperSize = "INVOICE";
    } else {
      if (orientation === "portrait") {
        width = 595;
        height = 842;
        paperSize = "A4";
      } else {
        width = 842;
        height = 595;
        paperSize = "A4_LANDSCAPE";
      }
    }

    // 4. Construct Gemini request
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `You are a professional graphic designer and Fabric.js canvas template generator.
Your task is to generate a beautiful, highly aesthetic canvas design layout based on the user's prompt, style theme, and dimensions.

Dimensions of the target canvas:
- Width: ${width}px
- Height: ${height}px
- Paper Size Preset: ${paperSize}
- Style Theme: ${style}

COORDINATE INSTRUCTIONS:
- The top-left of the canvas is coordinates (0, 0).
- All element positions (left, top) must reside within the canvas boundary.
- For centering text or elements horizontally, calculate: left = (canvasWidth - elementWidth) / 2.
- For a Textbox element with textAlign "center", you MUST specify a width (e.g. 500 or 600) and position it centrally.
- Add background color to the canvasJson.background field, or place a full-width background rectangle.

OBJECT SPECIFICATION (Fabric.js Objects):
1. Textbox:
   - type: "Textbox"
   - text: The string content. Use dynamic placeholders like {{name}}, {{course}}, {{issued_date}}, {{certificate_id}} in uppercase/lowercase context so users can merge values later.
   - left: number
   - top: number
   - width: number (e.g., 500)
   - fontSize: number (e.g., 32)
   - fontFamily: "Georgia" | "Helvetica" | "Courier New" | "Arial"
   - fill: hex color code (e.g., "#1e3a5f")
   - fontWeight: "bold" | "normal"
   - fontStyle: "italic" | "normal"
   - textAlign: "center" | "left" | "right"
2. Rect:
   - type: "Rect"
   - left: number, top: number, width: number, height: number
   - fill: hex color or "transparent"
   - stroke: hex color or null
   - strokeWidth: number
   - rx: number, ry: number (optional, for rounded corners)
3. Line:
   - type: "Line"
   - left: number, top: number
   - x1: number, y1: number, x2: number, y2: number (e.g., for horizontal line, x1=0, y1=0, x2=400, y2=0)
   - stroke: hex color
   - strokeWidth: number
4. Circle:
   - type: "Circle"
   - left: number, top: number, radius: number
   - fill: hex color

DESIGN BEST PRACTICES:
- Keep borders clean. (e.g. a thin inner rectangle border: left: 20, top: 20, width: ${width - 40}, height: ${height - 40}, stroke: a premium gold/navy color, fill: "transparent").
- Create a visual hierarchy (large, bold titles; smaller subtitles; spaced out signature lines).
- Select a beautiful color palette based on the prompt or style (e.g., navy blue & gold, forest green & emerald, dark slate & orange, warm paper tone, etc.).

Return the template in the exact JSON format specified in the JSON schema.`;

    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a template layout based on this request: "${prompt}". Make sure it fits the ${orientation} layout dimensions (${width}x${height}) and matches the ${style} style.`,
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            name: {
              type: "STRING",
              description: "A descriptive title for the generated template.",
            },
            width: {
              type: "INTEGER",
              description: "The width of the template.",
            },
            height: {
              type: "INTEGER",
              description: "The height of the template.",
            },
            paperSize: {
              type: "STRING",
              description: "The paper size preset (e.g. A4_LANDSCAPE, A4, CUSTOM).",
            },
            canvasJson: {
              type: "OBJECT",
              description: "Fabric.js canvas compatible JSON structure.",
              properties: {
                version: {
                  type: "STRING",
                  description: "Standard version, e.g. '7.0.0'.",
                },
                background: {
                  type: "STRING",
                  description: "Hex background color (e.g. '#ffffff' or '#121212').",
                },
                objects: {
                  type: "ARRAY",
                  description: "Array of Fabric.js compatible object declarations.",
                  items: {
                    type: "OBJECT",
                    properties: {
                      type: { type: "STRING" },
                      text: { type: "STRING" },
                      left: { type: "NUMBER" },
                      top: { type: "NUMBER" },
                      width: { type: "NUMBER" },
                      height: { type: "NUMBER" },
                      fontSize: { type: "NUMBER" },
                      fontFamily: { type: "STRING" },
                      fill: { type: "STRING" },
                      stroke: { type: "STRING" },
                      strokeWidth: { type: "NUMBER" },
                      textAlign: { type: "STRING" },
                      fontWeight: { type: "STRING" },
                      fontStyle: { type: "STRING" },
                      charSpacing: { type: "NUMBER" },
                      lineHeight: { type: "NUMBER" },
                      rx: { type: "NUMBER" },
                      ry: { type: "NUMBER" },
                      radius: { type: "NUMBER" },
                      x1: { type: "NUMBER" },
                      y1: { type: "NUMBER" },
                      x2: { type: "NUMBER" },
                      y2: { type: "NUMBER" },
                    },
                    required: ["type"],
                  },
                },
              },
              required: ["version", "background", "objects"],
            },
          },
          required: ["name", "width", "height", "paperSize", "canvasJson"],
        },
      },
    };

    // 5. Fetch from Gemini API
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      return NextResponse.json(
        { success: false, error: `Gemini API returned error: ${response.statusText}` },
        { status: 500 }
      );
    }

    const resultData = await response.json();
    const candidateText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json({ success: false, error: "Failed to receive template from AI" }, { status: 502 });
    }

    const parsedTemplate = JSON.parse(candidateText);

    // Normalize Fabric.js object types to match expected PascalCase/lowercase class names
    if (parsedTemplate.canvasJson && Array.isArray(parsedTemplate.canvasJson.objects)) {
      const typeMapping: Record<string, string> = {
        textbox: "Textbox",
        rect: "Rect",
        line: "Line",
        circle: "Circle",
        image: "image",
        path: "Path",
        polygon: "Polygon",
        polyline: "Polyline",
        ellipse: "Ellipse",
        triangle: "Triangle",
        group: "Group",
      };

      parsedTemplate.canvasJson.objects = parsedTemplate.canvasJson.objects.map((obj: unknown) => {
        const item = obj as Record<string, unknown>;
        if (typeof item.type === "string") {
          const lower = item.type.toLowerCase();
          if (typeMapping[lower]) {
            item.type = typeMapping[lower];
          }
        }
        // Make sure elements generated by AI are selectable and editable by default
        item.selectable = true;
        return item;
      });
    }

    return NextResponse.json({ success: true, ...parsedTemplate });
  } catch (error) {
    console.error("Error generating template:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
