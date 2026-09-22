import { NextResponse } from "next/server";
import { duplicateTemplate } from "@/lib/services/template-service";
import { AppError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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
    const { searchParams } = new URL(_req.url);
    const category = searchParams.get("category") || undefined;

    const template = await duplicateTemplate(id, user.id, category);
    return NextResponse.json({ success: true, data: template });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to duplicate template";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
