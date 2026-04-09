import { NextResponse } from "next/server";
import { getTemplateById, saveBuilderTemplate } from "@/lib/services/template-service";
import { SaveBuilderTemplateSchema } from "@/lib/schemas";
import { AppError } from "@/lib/errors";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await getTemplateById(id);
    return NextResponse.json({ success: true, data: template });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to get template";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const input = SaveBuilderTemplateSchema.parse(body);
    const template = await saveBuilderTemplate(input, id);
    return NextResponse.json({ success: true, data: template });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to update template";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
