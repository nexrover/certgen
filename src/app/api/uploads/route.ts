import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Invalid file type. Allowed: PNG, JPG, SVG" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File too large. Maximum 2MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "png";
    const path = `uploads/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from("certificates").getPublicUrl(path);

    return NextResponse.json({ success: true, data: { url: publicUrl, path } }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase.storage
      .from("certificates")
      .list(`uploads/${user.id}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      throw error;
    }

    const images = data
      .filter((file) => file.name !== ".emptyFolderPlaceholder" && file.id) // ignore placeholders
      .map((file) => {
        const path = `uploads/${user.id}/${file.name}`;
        const { data: { publicUrl } } = supabase.storage.from("certificates").getPublicUrl(path);
        return {
          url: publicUrl,
          name: file.name,
        };
      });

    return NextResponse.json({ success: true, data: images });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list uploads";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json({ success: false, error: "File name is required" }, { status: 400 });
    }

    const path = `uploads/${user.id}/${name}`;

    const { error } = await supabase.storage.from("certificates").remove([path]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete upload";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
