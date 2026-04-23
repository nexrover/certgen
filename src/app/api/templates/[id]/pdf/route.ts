import { NextResponse } from "next/server";
import { getTemplateById } from "@/lib/services/template-service";
import { canvasJsonToPdf, closeBrowser } from "@/lib/engine/canvas-renderer";
import { AppError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const template = await getTemplateById(id, user.id);

    if (!template.canvas_json) {
      return NextResponse.json(
        { success: false, error: "Template has no canvas data" },
        { status: 400 }
      );
    }

    const pdfBuffer = await canvasJsonToPdf(
      template.canvas_json,
      template.width,
      template.height
    );

    await closeBrowser();

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${template.name}.pdf"`,
      },
    });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "PDF generation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
