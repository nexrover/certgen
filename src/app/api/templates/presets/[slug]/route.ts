import { NextResponse } from "next/server";
import { PRESET_TEMPLATES } from "@/lib/builder/preset-templates";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const preset = PRESET_TEMPLATES[slug];
  if (!preset) {
    return NextResponse.json({ error: "Preset not found" }, { status: 404 });
  }
  return NextResponse.json(preset);
}
