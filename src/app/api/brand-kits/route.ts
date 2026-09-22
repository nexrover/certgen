import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  listBrandKits,
  createBrandKit,
  type CreateBrandKitInput,
} from "@/lib/services/brand-kit-service";

/**
 * GET /api/brand-kits — List all brand kits for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const kits = await listBrandKits(user.id);
    return NextResponse.json({ success: true, data: kits });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to list brand kits";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/brand-kits — Create a new brand kit
 * Body: { name, colors?, typography?, logos?, graphics?, photos?, elements? }
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CreateBrandKitInput;

    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Brand kit name is required" },
        { status: 400 }
      );
    }

    const kit = await createBrandKit(body, user.id);
    return NextResponse.json({ success: true, data: kit }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create brand kit";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
