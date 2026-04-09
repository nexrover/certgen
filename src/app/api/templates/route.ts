import { NextResponse } from "next/server";
import { CreateTemplateSchema, SaveBuilderTemplateSchema } from "@/lib/schemas";
import { createTemplate, listTemplates, saveBuilderTemplate } from "@/lib/services/template-service";
import { AppError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.canvasJson) {
      const input = SaveBuilderTemplateSchema.parse(body);
      const template = await saveBuilderTemplate(input);
      return NextResponse.json({ success: true, data: template }, { status: 201 });
    }

    const input = CreateTemplateSchema.parse(body);
    const template = await createTemplate(input);
    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to create template";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const templates = await listTemplates();
    return NextResponse.json({ success: true, data: templates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list templates";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
