import { NextResponse } from "next/server";
import { CreateTemplateSchema, SaveBuilderTemplateSchema } from "@/lib/schemas";
import { createTemplate, listTemplates, saveBuilderTemplate } from "@/lib/services/template-service";
import { AppError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.canvasJson) {
      const input = SaveBuilderTemplateSchema.parse(body);
      const template = await saveBuilderTemplate(input, user.id);
      return NextResponse.json({ success: true, data: template }, { status: 201 });
    }

    const input = CreateTemplateSchema.parse(body);
    const template = await createTemplate(input, user.id);
    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to create template";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;

    const templates = await listTemplates(user.id, category);
    return NextResponse.json({ success: true, data: templates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list templates";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
