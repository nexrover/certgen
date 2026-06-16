import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getBrandKitById,
  updateBrandKit,
  deleteBrandKit,
  type UpdateBrandKitInput,
} from "@/lib/services/brand-kit-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/brand-kits/[id] — Get a single brand kit by ID
 */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const kit = await getBrandKitById(id, user.id);
    return NextResponse.json({ success: true, data: kit });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Brand kit not found";
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 }
    );
  }
}

/**
 * PATCH /api/brand-kits/[id] — Update a brand kit
 * Body: { name?, colors?, typography?, logos?, graphics?, photos?, elements? }
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const body = (await req.json()) as UpdateBrandKitInput;
    const kit = await updateBrandKit(id, user.id, body);
    return NextResponse.json({ success: true, data: kit });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update brand kit";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/brand-kits/[id] — Delete a brand kit
 */
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    await deleteBrandKit(id, user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete brand kit";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
